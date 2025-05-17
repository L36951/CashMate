import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Transaction, GroupedTransactions} from '../types/transaction';
import {
  createTable,
  groupByDate,
  getTransactionsByMonth,
} from '../storage/transactionStorage';
import {DonutChart} from '../components/DonutChart/DonutChart';
import {TransactionGroup} from '../components/TransactionGroup/TransactionGroup';
import {useFocusEffect} from '@react-navigation/native';
import {MonthSelector} from '../components/YearMonthSelector/YearMonthSelector';

import {handleDeleteTransaction} from '../storage/transactionStorage';
import {HeaderMenu} from '../components/HeaderMenu/HeaderMenu';
export const HomeScreen = ({navigation}: any) => {
  const [groupedTransactions, setGroupedTransactions] =
    useState<GroupedTransactions>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const [currentYear, setCurrentYear] = useState(
    new Date().toISOString().slice(0, 4),
  );
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(5, 7),
  );

  const fetchTransactions = useCallback(async () => {
    const txs = await getTransactionsByMonth(`${currentYear}-${currentMonth}`);
    setTransactions(txs);
  }, [currentMonth, currentYear]);

  useFocusEffect(
    // fetch transactions when screen is focused
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
  );

  useEffect(() => {
    // Group transactions by date
    // calculate income and expense
    const calculateIncomeExpense = (txs: Transaction[]) => {
      const totalIncome = txs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = Math.abs(
        txs
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      );

      setIncome(totalIncome);
      setExpense(totalExpense);
    };

    setGroupedTransactions(groupByDate(transactions));
    calculateIncomeExpense(transactions);
  }, [transactions]);

  useEffect(() => {
    // fetch transactions when month or year changes
    fetchTransactions();
  }, [fetchTransactions, currentMonth, currentYear]);

  useEffect(() => {
    // Initialize SQLite database
    createTable();
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <View style={styles.container}>
      <HeaderMenu navigation={navigation} />

      <View>
        <MonthSelector
          selectedYear={currentYear}
          selectedMonth={currentMonth}
          onSelect={(year, month) => {
            console.log(year, month);
            setCurrentYear(year);
            setCurrentMonth(month);
          }}
        />
      </View>

      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={{paddingBottom: 100}}>
          <DonutChart income={income} expense={expense} />

          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <TransactionGroup
              key={date}
              date={date}
              transactions={txs}
              onDelete={handleDeleteTransaction}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddExpense')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // ⭐ 透明
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  balance: {fontSize: 22, fontWeight: 'bold', marginBottom: 16},
  item: {fontSize: 16, paddingVertical: 4},
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addButton: {
    backgroundColor: 'rgb(241, 99, 74)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100, // 圓形按鈕
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', // 如果你要它在中間
  },

  addButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30, // 距離底部30px
    alignSelf: 'center',
    backgroundColor: 'rgb(241, 99, 74)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // 安卓有陰影
    shadowColor: '#000', // iOS 陰影
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
