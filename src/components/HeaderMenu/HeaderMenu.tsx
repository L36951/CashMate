import {Text} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

export const HeaderMenu = ({navigation}: any) => {
  return (
    <Menu style={{position: 'relative', marginTop: 10, marginBottom: 5}}>
      <MenuTrigger style={{alignSelf: 'flex-end', marginRight: 5}}>
        <Text style={{fontSize: 24, paddingHorizontal: 16}}>⋮</Text>
      </MenuTrigger>

      <MenuOptions
        customStyles={{
          optionsContainer: {
            marginTop: 40,
            marginLeft: 160,
          },
        }}>
        <MenuOption onSelect={() => navigation.navigate('Setting')}>
          <Text style={{padding: 10}}>⚙️ 設定</Text>
        </MenuOption>
        <MenuOption onSelect={() => navigation.navigate('GoogleBackUpScreen')}>
          <Text style={{padding: 10}}>☁️ 雲端備份</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};
