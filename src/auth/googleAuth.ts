import {GoogleSignin} from '@react-native-google-signin/google-signin'

import { GOOGLE_WEB_CLIENT_ID } from '@env'

export const configureGoogleSignin = ()=>{
    console.log(GOOGLE_WEB_CLIENT_ID)
    GoogleSignin.configure({
        webClientId:'429229009148-f77pbj2svm25b8t3luu0jrsfvq6ougds.apps.googleusercontent.com',
        scopes:['https://www.googleapis.com/auth/drive.file'],
        offlineAccess: true, // 可選
    })
}
export const testGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      console.log("HI")
      const userInfo = await GoogleSignin.signIn();
      console.log('成功登入', userInfo);
    } catch (err) {
      console.error('登入失敗', err);
    }
  };
export const loginAndGetAccessToken = async(): Promise<{
    accessToken:string;
    user:{
        email:string;
        name:string;
        id:string;
        photo?:string;
    };
}> =>{
    try{
        console.log('HI');
        await GoogleSignin.hasPlayServices();
        const result = await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        console.log(result);
        
        return{
            accessToken:tokens.accessToken,
            user:result.user
        };
        
       

    }
    catch(error){
        console.error('Google 登入失敗',error);
        throw error;
    }
}