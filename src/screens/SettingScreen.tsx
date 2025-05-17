import React from 'react';
import {View, Text, StyleSheet, Button, Alert} from 'react-native';
import {
  clearAllTransactionsAsync,
  dropTransactionTableAsync,
  insertTransactionAsync,
} from '../storage/transactionStorage';
import {transactionDummyData} from '../utils/dummyData/transaction';

export const SettingScreen = () => {
  const handleClearTransactions = async () => {
    await clearAllTransactionsAsync();
    await dropTransactionTableAsync();
    Alert.alert('完成', '✅ 所有交易已清除');
  };

  const handleAddDummyData = async () => {
    for (const tx of transactionDummyData) {
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
