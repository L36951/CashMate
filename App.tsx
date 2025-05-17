import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './src/screens/HomeScreen';
import {AddExpenseScreen} from './src/screens/AddExpenseScreen';
import {GoogleBackUpScreen} from './src/screens/GoogleBackupScreen';
import {SettingScreen} from './src/screens/SettingScreen';
import {MenuProvider} from 'react-native-popup-menu';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AddNewCategoryScreen} from './src/screens/AddNewCategoryScreen';
export type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  GoogleBackUpScreen: undefined;
  Setting: undefined;
  AddCategory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <MenuProvider>
        {' '}
        {/* 🔥一定要在最外層！ */}
        <NavigationContainer>
          <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{title: 'Add Record'}}
            />
            <Stack.Screen
              name="GoogleBackUpScreen"
              component={GoogleBackUpScreen}
              options={{title: 'Sign In'}}
            />
            <Stack.Screen
              name="Setting"
              component={SettingScreen}
              options={{title: 'settings'}}
            />
            <Stack.Screen
              name="AddCategory"
              component={AddNewCategoryScreen}
              options={{title: 'Add Category'}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}

export default App;
