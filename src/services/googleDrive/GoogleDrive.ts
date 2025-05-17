import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin"

import AsyncStorage from "@react-native-async-storage/async-storage";
import {GOOGLE_WEB_CLIENT_ID} from '@env';
import { Alert } from "react-native";
import axios from "axios";
import RNFS from 'react-native-fs';
 const showErr = (msg: string) => Alert.alert('錯誤', msg);

export const configureGoogle =()=>{
     GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
}

export  const userSignIn = async () => {

    try {
      await GoogleSignin.signOut(); // 保證重新登入
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
        return res.data;
      }
    } catch (e) {
      if (isErrorWithCode(e)) {
        if (e.code !== statusCodes.SIGN_IN_CANCELLED) showErr(e.message);
      } else {
        showErr('Google 登入失敗');
      }
    } 
  };

export const getAccessToken = async () => (await GoogleSignin.getTokens()).accessToken;

export const getAllBackups = async (accessToken: string) => {
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

  export const ensureFolder = async (accessToken: string) => {
    const q =
        "mimeType='application/vnd.google-apps.folder' and name='CashMate' and trashed=false";
    const {data} = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: {Authorization: `Bearer ${accessToken}`},
        params: {q, fields: 'files(id)'},
    });
    if (data.files.length) {return data.files[0].id}

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
  const filename = 'cashmate_' + dateString + '_' + timeString + '.db'; // ⭐ 自動產生檔名

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

  export const downloadFromDrive = async (fileId: string, fileName: string) => {
    const accessToken = await getAccessToken();
    try {
      await downloadFile(accessToken, fileId);
      Alert.alert('完成', `📥 已還原：${fileName}`);
      return true
    } catch (e: any) {
      showErr(e?.message ?? '還原失敗');
        return false
    } 
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

 export const uploadDBToDrive = async () => {
    const accessToken = await getAccessToken();
    const dbPath = `${RNFS.DocumentDirectoryPath}/cashmate.db`;
    if (!(await RNFS.exists(dbPath))) return showErr('資料庫不存在');

    try {

      const folderId = await ensureFolder(accessToken);
      await uploadFile(accessToken, folderId, dbPath);
      Alert.alert('完成', '📤 資料庫已備份到 Google Drive');
    } catch (e: any) {
      showErr(e?.message ?? '上傳失敗');
    } 
  };

    export const getBackupList = async () => {
      const accessToken = await getAccessToken();
      try {
        const files = await getAllBackups(accessToken);
        if (!files.length) throw new Error('找不到任何備份檔案，請先執行備份。');
        return files
      } catch (e: any) {
        showErr(e?.message ?? '下載失敗');
      } 
    };

    export  const getCachedUserInfo = async () => {
      const cached = await AsyncStorage.getItem('userInfo');
      return cached && JSON.parse(cached);

    };