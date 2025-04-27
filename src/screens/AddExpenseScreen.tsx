import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import {insertTransactionAsync} from '../storage/transactionStorage';
import {Transaction} from '../types/transaction';
import DateTimePicker from '@react-native-community/datetimepicker';
import {NumericKeyboard} from '../components/NumericKeyboard/NumericKeyboard';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AddExpenseScreen = ({navigation}: any) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [, setRefresh] = useState(false);
  const forceUpdate = () => setRefresh(r => !r);
  const [incomeCategories, setIncomeCategories] = useState([
    {icon: '💼', category: 'Salary', defaultRemark: '薪水'},
    {icon: '🎁', category: 'Gift', defaultRemark: '禮物'},
    {icon: '💰', category: 'Bonus', defaultRemark: '獎金'},
    {icon: '📈', category: 'Investment', defaultRemark: '投資'},
  ]);

  const [expenseCategories, setExpenseCategories] = useState([
    {icon: '🍔', category: 'Food', defaultRemark: '食物'},
    {icon: '🚌', category: 'Transport', defaultRemark: '交通'},
    {icon: '🏠', category: 'Housing', defaultRemark: '房租'},
    {icon: '📱', category: 'Utilities', defaultRemark: '電子產品'},
    {icon: '🎮', category: 'Entertainment', defaultRemark: '娛樂'},
  ]);
  const [icon, setIcon] = useState(expenseCategories[0].icon);
  const [remark, setRemark] = useState(expenseCategories[0].defaultRemark);
  const [category, setCategory] = useState(expenseCategories[0].category);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTarget, setEmojiTarget] = useState<'newCategory' | null>(null);
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);
  const emojiList = [
    '🍔',
    '🍟',
    '🍕',
    '🍜',
    '🍣',
    '🍰',
    '☕',
    '🍺',
    '🛒',
    '🛍️',
    '🎁',
    '🏠',
    '🚗',
    '🚌',
    '🛵',
    '📱',
    '💻',
    '📺',
    '🎮',
    '🎬',
    '🎤',
    '🎨',
    '🏀',
    '⚽',
    '💼',
    '💰',
    '🏦',
    '💳',
    '🩺',
    '💊',
    '✈️',
    '🏖️',
    '🐶',
    '🐱',
    '🧹',
    '🛠️',
    '🛏️',
  ];

  const openEmojiSelector = () => {
    setEmojiModalVisible(true);
  };

  useEffect(() => {
    const loadCategories = async () => {
      const savedIncome = await AsyncStorage.getItem('incomeCategories');
      const savedExpense = await AsyncStorage.getItem('expenseCategories');
      if (savedIncome) {
        setIncomeCategories(JSON.parse(savedIncome));
      }
      if (savedExpense) {
        setExpenseCategories(JSON.parse(savedExpense));
      }
    };
    loadCategories();
  }, []);
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
  const displayedCategories = [
    {isAddButton: true}, // 🔥 第一個是新增按鈕
    ...(type === 'income' ? incomeCategories : expenseCategories),
  ];
  const handleAddCategory = () => {
    setNewCategoryEmoji('');
    setNewCategoryName('');
    setShowAddCategoryModal(true);
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
                type === 'expense' && styles.expenseSelected,
              ]}
              onPress={() => {
                setType('expense');
                setIcon(expenseCategories[0].icon); // 食物的icon
                setCategory(expenseCategories[0].category);
                setRemark(expenseCategories[0].defaultRemark);
              }}>
              <Text style={styles.toggleText}>支出</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === 'income' && styles.incomeSelected,
              ]}
              onPress={() => {
                setType('income');
                setIcon(incomeCategories[0].icon); // 薪水的icon
                setCategory(incomeCategories[0].category);
                setRemark(incomeCategories[0].defaultRemark);
              }}>
              <Text style={styles.toggleText}>收入</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={padCategories(displayedCategories, 4)}
        keyExtractor={(item, index) => index.toString()}
        numColumns={4}
        renderItem={({item}) =>
          item.empty ? (
            <View style={styles.iconPlaceholder} />
          ) : item.isAddButton ? ( // 🔥 新增分類按鈕
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: '#eee'}]}
              onPress={handleAddCategory}>
              <Text style={{fontSize: 32}}>➕</Text>
              <Text style={{fontSize: 12}}>新增</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.iconButton,
                type === 'income'
                  ? {backgroundColor: '#87CEFA'}
                  : {backgroundColor: '#FFC23C'},
              ]}
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
      {showAddCategoryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>新增分類</Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput
                style={[styles.modalInput, {flex: 1}]}
                placeholder="輸入 Emoji，例如 🐶"
                value={newCategoryEmoji}
                onChangeText={setNewCategoryEmoji}
                maxLength={2}
              />
              <TouchableOpacity
                onPress={openEmojiSelector} // ✅ 只保留這個！
                style={styles.emojiButton}>
                <Text style={styles.emojiButtonText}>😀</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="輸入分類名稱，例如 寵物"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddCategoryModal(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  if (!newCategoryEmoji.trim() || !newCategoryName.trim()) {
                    Alert.alert('錯誤', '請完整輸入 Emoji 和分類名稱');
                    return;
                  }
                  const newCategory = {
                    icon: newCategoryEmoji.trim(),
                    category: newCategoryName.trim(),
                    defaultRemark: newCategoryName.trim(),
                  };
                  if (type === 'income') {
                    const newList = [...incomeCategories, newCategory];
                    setIncomeCategories(newList);
                    await AsyncStorage.setItem(
                      'incomeCategories',
                      JSON.stringify(newList),
                    );
                  } else {
                    const newList = [...expenseCategories, newCategory];
                    setExpenseCategories(newList);
                    await AsyncStorage.setItem(
                      'expenseCategories',
                      JSON.stringify(newList),
                    );
                  }
                  setShowAddCategoryModal(false);
                }}>
                <Text style={styles.modalButtonText}>新增</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal
        visible={emojiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmojiModalVisible(false)}>
        <View style={styles.emojiPickerContainer}>
          <View style={styles.emojiGrid}>
            {emojiList.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => {
                  setNewCategoryEmoji(emoji);
                  setEmojiModalVisible(false); // 選完 emoji 馬上關掉 Modal
                }}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.closeEmojiButton}
            onPress={() => setEmojiModalVisible(false)}>
            <Text style={{fontSize: 16, color: '#333'}}>❌ 關閉</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  selected: {},
  expenseSelected: {backgroundColor: '#ffd700', borderColor: '#aaa'},
  incomeSelected: {
    borderColor: '#aaa',
    backgroundColor: '#3EC1F3',
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#3EC1F3',
    borderRadius: 6,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emojiButtonText: {
    fontSize: 24,
  },
  emojiPickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#fff',
    zIndex: 100,
  },
  emojiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  emojiModalContent: {
    backgroundColor: '#fff',
    height: '50%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  emojiPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 100,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  emojiText: {
    fontSize: 28,
  },
  closeEmojiButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
