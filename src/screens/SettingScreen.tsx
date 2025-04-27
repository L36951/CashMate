import React from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import {
  clearAllTransactionsAsync,
  dropTransactionTableAsync,
  insertTransactionAsync,
} from '../storage/transactionStorage';
import {Transaction} from '../types/transaction';

const dummyData: Transaction[] = [
  {
    id: '1',
    icon: '🥘',
    remark: 'Salary',
    amount: 5000,
    category: 'Income',
    date: '2025-04-01',
    type: 'income',
  },
  {
    id: '2',
    icon: '🥘',
    remark: 'Salary',
    amount: -3000,
    date: '2025-04-12',
    type: 'income',
    category: 'Job',
  },
  {
    id: '3',
    icon: '🥘',
    remark: 'Groceries',
    amount: -200,
    category: 'Food',
    date: '2025-03-02',
    type: 'expense',
  },
  {
    id: '4',
    icon: '🥘',
    remark: 'Rent',
    amount: -1500,
    category: 'Housing',
    date: '2025-03-03',
    type: 'expense',
  },
  {
    id: '5',
    icon: '🍿',
    remark: 'Utilities',
    amount: -300,
    category: 'Bills',
    date: '2025-02-04',
    type: 'expense',
  },
  {
    id: '6',
    icon: '🍔',
    remark: 'Investment',
    amount: 1000,
    category: 'Income',
    date: '2025-02-05',
    type: 'income',
  },
  {
    id: '7',
    icon: '🌭',
    remark: 'Investment',
    amount: 1000,
    category: 'Income',
    date: '2025-01-05',
    type: 'income',
  },
];

export const SettingScreen = () => {
  const handleClearTransactions = async () => {
    await clearAllTransactionsAsync();
    await dropTransactionTableAsync();
    Alert.alert('完成', '✅ 所有交易已清除');
  };

  const handleAddDummyData = async () => {
    for (const tx of dummyData) {
      await insertTransactionAsync(tx);
    }
    Alert.alert('完成', '✅ 已新增 Dummy 資料');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚙️ Setting Page</Text>
      <View style={styles.buttonContainer}>
        <Button title="🗑 清除所有交易" onPress={handleClearTransactions} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="➕ 生成 Dummy Data" onPress={handleAddDummyData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginVertical: 12,
  },
});
