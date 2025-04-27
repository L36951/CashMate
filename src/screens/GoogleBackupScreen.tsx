import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {Buffer} from 'buffer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {GOOGLE_WEB_CLIENT_ID} from '@env';
global.Buffer = global.Buffer || Buffer;

const WEB_CLIENT_ID = GOOGLE_WEB_CLIENT_ID;

export const GoogleBackUpScreen = () => {
  // ---------- state ----------
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<'upload' | 'download' | null>(null); // 備份 / 還原用
  // ---------- helpers ----------
  const showErr = (msg: string) => Alert.alert('錯誤', msg);
  const [backups, setBackups] = useState<{id: string; name: string}[]>([]);
  const [showBackupList, setShowBackupList] = useState(false);

  const configureGoogle = () =>
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

  const checkCachedLogin = useCallback(async () => {
    const cached = await AsyncStorage.getItem('userInfo');
    cached && setUser(JSON.parse(cached));
  }, []);
  const getAllBackups = async (accessToken: string) => {
    const folderId = await ensureFolder(accessToken);
    const {data} = await axios.get(
      'https://www.googleapis.com/drive/v3/files',
      {
        headers: {Authorization: `Bearer ${accessToken}`},
        params: {
          q: `'${folderId}' in parents and name contains '.db' and trashed=false`,
          orderBy: 'createdTime desc',
          fields: 'files(id,name,createdTime)',
        },
      },
    );
    return data.files;
  };

  // ---------- auth ----------
  const signIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut(); // 保證重新登入
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        setUser(res.data);
      }
    } catch (e) {
      if (isErrorWithCode(e)) {
        if (e.code !== statusCodes.SIGN_IN_CANCELLED) showErr(e.message);
      } else {
        showErr('Google 登入失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- drive ----------
  const getToken = async () => (await GoogleSignin.getTokens()).accessToken;

  const uploadDBToDrive = async () => {
    const accessToken = await getToken();
    const dbPath = `${RNFS.DocumentDirectoryPath}/cashmate.db`;
    if (!(await RNFS.exists(dbPath))) return showErr('資料庫不存在');

    try {
      setBusy('upload');
      const folderId = await ensureFolder(accessToken);
      await uploadFile(accessToken, folderId, dbPath);
      Alert.alert('完成', '📤 資料庫已備份到 Google Drive');
    } catch (e: any) {
      showErr(e?.message ?? '上傳失敗');
    } finally {
      setBusy(null);
    }
  };
  const openBackupList = async () => {
    const accessToken = await getToken();
    try {
      setBusy('download');
      const files = await getAllBackups(accessToken);
      if (!files.length) throw new Error('找不到任何備份檔案，請先執行備份。');
      setBackups(files);
      setShowBackupList(true);
    } catch (e: any) {
      showErr(e?.message ?? '下載失敗');
    } finally {
      setBusy(null);
    }
  };
  const handleDownload = async (fileId: string, fileName: string) => {
    const accessToken = await getToken();
    try {
      setBusy('download');
      await downloadFile(accessToken, fileId);
      Alert.alert('完成', `📥 已還原：${fileName}`);
      setShowBackupList(false);
    } catch (e: any) {
      showErr(e?.message ?? '還原失敗');
    } finally {
      setBusy(null);
    }
  };

  // ---------- effects ----------
  useEffect(() => {
    configureGoogle();
    checkCachedLogin();
  }, [checkCachedLogin]);

  // ---------- render ----------
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {busy && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        {!user && (
          <>
            <Text style={styles.title}>CashMate 雲端備份</Text>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
            />
          </>
        )}

        {user && (
          <>
            <View style={styles.card}>
              <Image source={{uri: user.user.photo}} style={styles.avatar} />
              <View style={{flex: 1}}>
                <Text style={styles.name}>{user.user.name}</Text>
                <Text style={styles.email}>{user.user.email}</Text>
              </View>
            </View>

            <PrimaryButton
              icon="upload"
              label="備份資料庫到 Google Drive"
              onPress={uploadDBToDrive}
              loading={busy === 'upload'}
              disabled={!!busy}
            />
            <PrimaryButton
              icon="download"
              label="選擇備份檔案還原"
              onPress={openBackupList}
              loading={busy === 'download'}
              disabled={!!busy}
            />

            <PrimaryButton
              icon="logout"
              label="登出 Google 帳號"
              onPress={async () => {
                await GoogleSignin.signOut();
                await AsyncStorage.removeItem('userInfo');
                setUser(null);
              }}
            />
          </>
        )}
      </ScrollView>
      {showBackupList && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇一個備份還原：</Text>

            <ScrollView contentContainerStyle={{alignItems: 'center'}}>
              {backups.map(file => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.backupItem}
                  onPress={() => handleDownload(file.id, file.name)}>
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowBackupList(false)}>
              <Text style={{color: 'red', marginTop: 12, fontSize: 16}}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// ---------- reusable UI ----------
const PrimaryButton = ({
  label,
  icon,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} disabled={disabled}>
    {loading ? (
      <ActivityIndicator color="#fff" style={{marginRight: 8}} />
    ) : (
      <Icon name={icon} size={20} style={styles.btnIcon} />
    )}
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
);

// ---------- GDrive helpers ----------
const ensureFolder = async (accessToken: string) => {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='CashMate' and trashed=false";
  const {data} = await axios.get('https://www.googleapis.com/drive/v3/files', {
    headers: {Authorization: `Bearer ${accessToken}`},
    params: {q, fields: 'files(id)'},
  });
  if (data.files.length) return data.files[0].id;

  const {data: created} = await axios.post(
    'https://www.googleapis.com/drive/v3/files',
    {name: 'CashMate', mimeType: 'application/vnd.google-apps.folder'},
    {headers: {Authorization: `Bearer ${accessToken}`}},
  );
  return created.id;
};

const uploadFile = async (
  accessToken: string,
  folderId: string,
  dbPath: string,
) => {
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10); // e.g., "2025-04-27"
  const timeString = now.toTimeString().slice(0, 5).replace(':', ''); // e.g., "1430"
  const filename = `cashmate_${dateString}_${timeString}.db`; // ⭐ 自動產生檔名

  const metadata = {
    name: filename,
    mimeType: 'application/x-sqlite3',
    parents: [folderId],
  };
  const boundary = 'foo_bar_baz';
  const fileData = await RNFS.readFile(dbPath, 'base64');
  const body = `--${boundary}\r\nContent-Type:application/json\r\n\r\n${JSON.stringify(
    metadata,
  )}\r\n--${boundary}\r\nContent-Type:application/x-sqlite3\r\nContent-Transfer-Encoding:base64\r\n\r\n${fileData}\r\n--${boundary}--`;

  await axios.post(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
    },
  );
};

const getLatestBackup = async (accessToken: string) => {
  const folderId = await ensureFolder(accessToken);
  const {data} = await axios.get('https://www.googleapis.com/drive/v3/files', {
    headers: {Authorization: `Bearer ${accessToken}`},
    params: {
      q: `'${folderId}' in parents and name contains '.db' and trashed=false`,
      orderBy: 'createdTime desc',
      fields: 'files(id,name,createdTime)',
    },
  });
  if (!data.files.length) throw new Error('找不到任何備份檔案，請先執行備份。');
  return data.files[0];
};

const downloadFile = async (accessToken: string, fileId: string) => {
  const {data} = await axios.get(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {Authorization: `Bearer ${accessToken}`},
      responseType: 'arraybuffer',
    },
  );
  const buffer = Buffer.from(data);
  const dbPath = `${RNFS.DocumentDirectoryPath}/cashmate.db`;
  await RNFS.writeFile(dbPath, buffer.toString('base64'), 'base64');
};

// ---------- styles ----------
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#fff'},
  container: {padding: 16, alignItems: 'center'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 20, fontWeight: '600', marginBottom: 24},
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  avatar: {width: 48, height: 48, borderRadius: 24, marginRight: 12},
  name: {fontSize: 16, fontWeight: '600'},
  email: {fontSize: 12, color: '#666'},
  btn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  btnIcon: {color: '#fff', marginRight: 8},
  btnText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  backupItem: {
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  modalCancel: {
    marginTop: 8,
  },
});
