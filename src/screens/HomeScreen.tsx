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
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {deleteTransactionByIdAsync} from '../storage/transactionStorage'; // 要有刪除API
import {Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // ✅ 用來顯示垃圾桶
import {Alert} from 'react-native';

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
  useFocusEffect(
    useCallback(() => {
      fetchTransactions(); // 🔥 每次回來都重新拿資料
    }, [currentMonth, currentYear]),
  );
  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      '刪除交易',
      '你確定要刪除這筆交易嗎？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            await deleteTransactionByIdAsync(id);
            await fetchTransactions();
          },
        },
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Text style={{fontSize: 24, paddingHorizontal: 16}}>⋮</Text>
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {width: 150, right: 0}, // 右上角打開
            }}>
            <MenuOption onSelect={() => navigation.navigate('Setting')}>
              <Text style={{padding: 10}}>⚙️ 設定</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => navigation.navigate('GoogleBackUpScreen')}>
              <Text style={{padding: 10}}>☁️ 雲端備份</Text>
            </MenuOption>
            <MenuOption onSelect={() => alert('登出功能稍後實作')}>
              <Text style={{padding: 10}}>🚪 登出</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

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
  const renderRightActions = (transactionId: string) => (
    <TouchableOpacity
      onPress={() => handleDeleteTransaction(transactionId)}
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: 8,
      }}>
      <Icon name="trash-can-outline" size={30} color="#fff" />
    </TouchableOpacity>
  );
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
