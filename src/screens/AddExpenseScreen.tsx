import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {insertTransactionAsync} from '../storage/transactionStorage';
import {Transaction} from '../types/transaction';
import DateTimePicker from '@react-native-community/datetimepicker';
import {NumericKeyboard} from '../components/NumericKeyboard/NumericKeyboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  incomeCategoryList,
  expenseCategoryList,
} from '../utils/categoryData/addRecordCategoryData';
import {IncomeExpenseToggle} from '../components/AddExpense/IncomeExpenseToggle';
import {CategoriesList} from '../components/AddExpense/CategoriesList';
import {AmountRemarkInput} from '../components/AddExpense/AmountRemarkInput';
import {useFocusEffect} from '@react-navigation/native';

export const AddExpenseScreen = ({navigation}: any) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [incomeCategories, setIncomeCategories] = useState(incomeCategoryList);

  const [expenseCategories, setExpenseCategories] =
    useState(expenseCategoryList);

  const [icon, setIcon] = useState(expenseCategories[0].icon);
  const [remark, setRemark] = useState(expenseCategories[0].defaultRemark);
  const [category, setCategory] = useState(expenseCategories[0].category);

  const onSave = async () => {
    if (!amount) {
      Alert.alert('Alert', 'Please enter Amount');
      return;
    }
    if (!remark) {
      Alert.alert('Alert', 'Please fill in Remark');
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

    navigation.goBack();
  };

  useEffect(() => {
    const initialCategory =
      type === 'income' ? incomeCategories[0] : expenseCategories[0];
    setIcon(initialCategory.icon);
    setCategory(initialCategory.category);
    setRemark(initialCategory.defaultRemark);
  }, [type, expenseCategories, incomeCategories]);

  useFocusEffect(
    // fetch transactions when screen is focused
    useCallback(() => {
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
    }, []),
  );

  return (
    <View style={styles.container}>
      <IncomeExpenseToggle setType={setType} type={type} />

      <CategoriesList
        setIcon={setIcon}
        setCategory={setCategory}
        setRemark={setRemark}
        type={type}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        navigation={navigation}
      />

      <AmountRemarkInput
        amount={amount}
        icon={icon}
        remark={remark}
        setRemark={setRemark}
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

  dateDisplay: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
});
