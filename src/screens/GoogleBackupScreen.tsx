import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Buffer} from 'buffer';

import {
  configureGoogle,
  userSignIn,
  downloadFromDrive,
  uploadDBToDrive,
  getBackupList,
  getCachedUserInfo,
} from '../services/googleDrive/GoogleDrive';
import {PrimaryButton} from '../components/Button/PrimaryButton';
import {BackupSelector} from '../components/BackupSelector/BackupSelector';
global.Buffer = global.Buffer || Buffer;

export const GoogleBackUpScreen = () => {
  // ---------- state ----------
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<'upload' | 'download' | null>(null); // 備份 / 還原用
  // ---------- helpers ----------
  const [backups, setBackups] = useState<{id: string; name: string}[]>([]);
  const [showBackupList, setShowBackupList] = useState(false);

  // ---------- auth ----------
  const handleSignIn = async () => {
    setLoading(true);
    setUser(await userSignIn());
    setLoading(false);
  };

  const handleUpload = async () => {
    setBusy('upload');

    await uploadDBToDrive();

    setBusy(null);
  };

  const openBackupList = async () => {
    setBusy('download');
    const files = await getBackupList();
    setBackups(files);
    setShowBackupList(true);
    setBusy(null);
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    setBusy('download');
    setShowBackupList(false);
    await downloadFromDrive(fileId, fileName);

    setBusy(null);
  };

  // ---------- effects ----------
  useEffect(() => {
    const checkCachedLogin = async () => {
      const userInfo = await getCachedUserInfo();
      userInfo && setUser(userInfo);
    };

    configureGoogle();
    checkCachedLogin();
  }, []);

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
              onPress={handleSignIn}
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
              onPress={handleUpload}
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
        <BackupSelector
          backups={backups}
          handleDownload={handleDownload}
          setShowBackupList={setShowBackupList}
        />
      )}
    </SafeAreaView>
  );
};

// ---------- reusable UI ----------

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

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
