/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';

import {StatusBar, SafeAreaView} from 'react-native';

import {HomeScreen} from './src/screens/HomeScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AddExpenseScreen} from './src/screens/AddExpenseScreen';
import {GoogleBackUpScreen} from './src/screens/GoogleBackupScreen';
//import {configureGoogleSignin} from './src/auth/googleAuth';
import {configureGoogleSignin} from './src/auth/googleAuth';

export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  GoogleBackUpScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  useEffect(() => {
    configureGoogleSignin(); // ✅ 初始化 Google Signin
  }, []);

  return (
    <NavigationContainer>
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: '首頁'}}
          />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="GoogleBackUpScreen"
            component={GoogleBackUpScreen}
            options={{title: 'Sign In'}}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
