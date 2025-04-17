import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import {insertTransactionAsync} from '../storage/transactionStorage';
import {Transaction} from '../types/transaction';
import DateTimePicker from '@react-native-community/datetimepicker';
import {NumericKeyboard} from '../components/NumericKeyboard/NumericKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';

const categories = [
  {icon: '🍔', category: 'Food', defaultRemark: '食物'},
  {icon: '🚌', category: 'Transport', defaultRemark: '交通'},
  {icon: '🏠', category: 'Housing', defaultRemark: '房租'},
  {icon: '📱', category: 'Utilities', defaultRemark: '電子產品'},
  {icon: '💼', category: 'Job', defaultRemark: '薪水'},
];
export const AddExpenseScreen = ({navigation}: any) => {
  const [icon, setIcon] = useState(categories[0].icon);
  const [remark, setRemark] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('General');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onSave = async () => {
    if (!remark || !amount) {
      Alert.alert('Alert', 'Please fill all fields');
      return;
    }

    const txData: Omit<Transaction, 'id'> = {
      remark,
      icon,
      amount:
        type === 'income'
          ? parseFloat(String(amount))
          : -parseFloat(String(amount)),
      type,
      category,
      date: date.toISOString().split('T')[0],
    };
    await insertTransactionAsync(txData);

    const year = txData.date.slice(0, 4);
    const month = txData.date.slice(5, 7);

    navigation.navigate('Home', {
      refresh: true,
      year,
      month,
    });
  };
  function padCategories(data: any[], columns: number) {
    const fullRows = Math.floor(data.length / columns);
    let lastRowCount = data.length - fullRows * columns;
    while (lastRowCount !== 0 && lastRowCount < columns) {
      data.push({empty: true});
      lastRowCount++;
    }
    return data;
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.side}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-circle" style={styles.arrowbackIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === 'income' && styles.selected,
              ]}
              onPress={() => setType('income')}>
              <Text style={styles.toggleText}>收入</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === 'expense' && styles.selected,
              ]}
              onPress={() => setType('expense')}>
              <Text style={styles.toggleText}>支出</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={padCategories(categories, 4)}
        keyExtractor={(item, index) => index.toString()}
        numColumns={4}
        renderItem={({item}) =>
          item.empty ? (
            <View style={styles.iconPlaceholder} />
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                setCategory(item.category);
                setRemark(item.defaultRemark);
                setIcon(item.icon);
              }}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text>{item.defaultRemark}</Text>
            </TouchableOpacity>
          )
        }
      />

      <View style={styles.catAndDate}>
        <Text style={styles.icon}>{icon}</Text>

        <TextInput
          style={[styles.input, styles.flexInput]}
          placeholder="$0"
          keyboardType="numeric"
          editable={false} // ⛔ 禁用輸入框
        >
          {amount !== '' ? '$' : ''}
          {amount}
        </TextInput>

        <TextInput
          style={[styles.input, styles.flexInput]}
          placeholder="備注"
          value={remark}
          onChangeText={setRemark}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="類別"
        value={category}
        onChangeText={setCategory}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateDisplay}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
      <View>
        <Button title="💾 儲存" onPress={onSave} />
      </View>
      <NumericKeyboard
        onPress={value => setAmount(prev => prev + value)}
        onDelete={() => setAmount(prev => prev.slice(0, -1))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
  },
  side: {
    width: 50,
    alignItems: 'center',
    position: 'absolute',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  flexInput: {
    flex: 1,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    borderRadius: 20,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selected: {
    backgroundColor: '#ffd700',
    borderColor: '#aaa',
  },
  toggleText: {
    fontSize: 16,
  },
  dateDisplay: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  arrowbackIcon: {
    color: '#333',
    fontSize: 36,
    zIndex: 10, // ✅ 確保它在最上層
  },
  backBtn: {
    marginRight: 12,
    position: 'absolute',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  iconButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '22%', // 控制最多 4 個一行
  },
  icon: {
    fontSize: 28,
  },
  iconPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: 'transparent',
  },
  catAndDate: {
    flexDirection: 'row',
  },
});
