import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  emojiList,
  incomeCategoryList,
  expenseCategoryList,
} from '../utils/categoryData/addRecordCategoryData';
import {IncomeExpenseToggle} from '../components/AddExpense/IncomeExpenseToggle';
import {FlatList} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
export const AddNewCategoryScreen = ({navigation}: any) => {
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [incomeCategories, setIncomeCategories] = useState(incomeCategoryList);

  const [expenseCategories, setExpenseCategories] =
    useState(expenseCategoryList);
  const [type, setType] = useState<'income' | 'expense'>('expense');
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

  const handleAddNewCategory = async () => {
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
      Alert.alert('成功', '新增分類成功');
      await AsyncStorage.setItem('incomeCategories', JSON.stringify(newList));
    } else {
      const newList = [...expenseCategories, newCategory];

      await AsyncStorage.setItem('expenseCategories', JSON.stringify(newList));
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.flexContainer}>
      <View>
        <View>
          <IncomeExpenseToggle type={type} setType={setType} />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.emojiInput]}
              placeholder="Select Emoji"
              value={newCategoryEmoji}
              onChangeText={setNewCategoryEmoji}
              maxLength={2}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Enter Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
          </View>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleAddNewCategory}>
              <Text style={styles.modalButtonText}>新增</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.flexContainer}>
        <FlatList
          data={emojiList}
          keyExtractor={(item, index) => index.toString()}
          numColumns={6}
          contentContainerStyle={styles.flatListContainer} // ⭐ 加這行
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                setNewCategoryEmoji(item);
              }}>
              <Text style={styles.emojiText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  flatListContainer: {
    paddingBottom: 40,
  },
  emojiListContainer: {
    flex: 1,
  },
  inputContainer: {flexDirection: 'row'},
  emojiInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    textAlign: 'center',
    width: 70,
    height: 70,
    fontSize: 20,
    margin: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    height: 70,
    flex: 1,
    marginRight: 15,
    marginTop: 15,
    fontSize: 20,
    padding: 10,
  },
  emojiButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#eee',
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

  emojiText: {
    fontSize: 28,
  },
});
