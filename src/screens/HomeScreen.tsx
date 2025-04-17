import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Transaction, GroupedTransactions} from '../types/transaction';
import SQLite from 'react-native-sqlite-2';
import {
  getAllTransactionsAsync,
  insertTransactionAsync,
  createTable,
  clearAllTransactionsAsync,
  groupByDate,
  dropTransactionTableAsync,
  getTransactionsByMonth,
} from '../storage/transactionStorage';
import * as d3 from 'd3-shape';
import {DonutChart} from '../components/DonutChart/DonutChart';
import {TransactionGroup} from '../components/TransactionGroup/TransactionGroup';
import {useFocusEffect} from '@react-navigation/native';
import {MonthSelector} from '../components/YearMonthSelector/YearMonthSelector';
import {useRoute} from '@react-navigation/native';
import {loginAndGetAccessToken, testGoogleLogin} from '../auth/googleAuth';
//import {GOOGLE_WEB_CLIENT_ID} from '@env';
//import {GoogleSignin} from '@react-native-google-signin/google-signin';
//import {loginAndGetAccessToken} from '../auth/googleAuth';
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

export const HomeScreen = ({navigation}: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] =
    useState<GroupedTransactions>({});
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const borderWidth = 2;
  const radius = 80;
  const strokeWidth = 60;
  const center = radius + strokeWidth + 1;
  const [incomePath, setIncomePath] = useState<string | null>(null);
  const [expensePath, setExpensePath] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(
    new Date().toISOString().slice(0, 4),
  );
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(5, 7),
  );
  const route = useRoute();
  useEffect(() => {
    if (route.params?.refresh) {
      const {year, month} = route.params;
      setCurrentYear(year);
      setCurrentMonth(month);
      // ❗️清掉 param 避免重複觸發
      navigation.setParams({refresh: false});
    }
  }, [route.params]);

  useEffect(() => {
    fetchTransactions();
  }, [currentMonth, currentYear]);
  const signIn = async () => {
    try {
      const {accessToken, user} = await loginAndGetAccessToken();
      console.log('✅ 使用者:', user.email);
      console.log('🔑 AccessToken:', accessToken);

      // 接下來你就可以用 accessToken 傳送備份到 Google Drive
    } catch (err) {
      console.error('登入失敗', err);
    }
  };

  const addDummyData = () => {
    for (const tx of dummyData) {
      insertTransactionAsync(tx).then(() => console.log('Transaction added'));
    }
    fetchTransactions();
  };
  useEffect(() => {
    createTable();

    fetchTransactions();
  }, []); // Initialize SQLite database

  const fetchTransactions = async () => {
    const txs = await getTransactionsByMonth(`${currentYear}-${currentMonth}`);
    setTransactions(txs);
    setGroupedTransactions(groupByDate(txs));

    // 💡 把 ratio 計算也寫進來
    const totalIncome = txs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = Math.abs(
      txs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    );
    const incRatio =
      totalIncome + totalExpense > 0
        ? (totalIncome / (totalIncome + totalExpense)) * 100
        : 50;

    const hasBothSides = totalIncome > 0 && totalExpense > 0;
    const bothTheSame = totalIncome === totalExpense;
    const pad = hasBothSides || bothTheSame ? 0.03 : 0;

    const arcGenInc = d3
      .arc()
      .innerRadius(radius)
      .outerRadius(radius + strokeWidth)
      .startAngle(0 + pad)
      .endAngle((incRatio / 100) * 2 * Math.PI - pad);
    const arcGenExp = d3
      .arc()
      .innerRadius(radius)
      .outerRadius(radius + strokeWidth)
      .startAngle((incRatio / 100) * 2 * Math.PI + pad)
      .endAngle(2 * Math.PI - pad);

    setIncomePath(arcGenInc({} as d3.DefaultArcObject) || '');
    setExpensePath(arcGenExp({} as d3.DefaultArcObject) || '');
    setIncome(totalIncome);
    setExpense(totalExpense);
  };

  const total = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0); // 0 is the initial value of the sum

  return (
    <View style={styles.container}>
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

      <ScrollView>
        <DonutChart income={income} expense={expense} />

        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <TransactionGroup key={date} date={date} transactions={txs} />
        ))}
      </ScrollView>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <Button
          title="☁ 備份"
          onPress={() => navigation.navigate('GoogleBackUpScreen')}
        />
        <Button
          title="🗑️ 清除所有交易"
          onPress={() => {
            clearAllTransactionsAsync();
            dropTransactionTableAsync();
            fetchTransactions();
          }}
        />
        <Button title="dummy" onPress={addDummyData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, flex: 1, backgroundColor: '#fff'},
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
});
