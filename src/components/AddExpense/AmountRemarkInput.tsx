import {StyleSheet, Text, TextInput, View} from 'react-native';

interface AmountRemarkInputProps {
  amount: string;
  icon: string;
  remark: string;
  setRemark: (remark: string) => void;
}
export const AmountRemarkInput = ({
  amount,
  icon,
  remark,
  setRemark,
}: AmountRemarkInputProps) => {
  return (
    <View style={styles.catAndDate}>
      <Text style={styles.icon}>{icon}</Text>

      <TextInput
        style={[styles.input, styles.flexInput]}
        placeholder="$0"
        keyboardType="numeric"
        editable={false} // ⛔ 禁用輸入框
      >
        <Text>
          {amount !== '' ? '$' : ''}
          {amount}
        </Text>
      </TextInput>

      <TextInput
        style={[styles.input, styles.flexInput]}
        placeholder="備注"
        value={remark}
        onChangeText={setRemark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  catAndDate: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  icon: {
    fontSize: 28,
  },
  flexInput: {
    flex: 1,
  },
});
