import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Transaction} from '../../types/transaction';
import {Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  date: string;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionGroup = ({date, transactions, onDelete}: Props) => {
  const renderRightActions = (transactionId: string) => (
    <TouchableOpacity
      onPress={() => onDelete(transactionId)}
      style={styles.deleteButton}>
      <Icon name="trash-can-outline" size={30} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.groupContainer}>
      {/* 日期列 */}
      <View style={styles.groupHeader}>
        <Text style={styles.dateLabel}>{date}</Text>
        <Text style={styles.totalAmount}>
          $ {transactions.reduce((sum, t) => sum + t.amount, 0)}
        </Text>
      </View>

      {/* 分隔線 */}
      <View style={styles.separator} />

      {/* 每一筆交易 */}
      {transactions.map(transaction => (
        <Swipeable
          key={transaction.id}
          renderRightActions={() => renderRightActions(transaction.id)}>
          <View style={styles.signlelineTransacion}>
            {/* 左邊 icon + remark */}
            <View style={styles.txLeft}>
              <Text style={styles.txItem}>
                {transaction.icon} {transaction.remark}
              </Text>
            </View>

            {/* 右邊金額 */}
            <View style={styles.txRight}>
              <Text style={styles.txItem}>$ {transaction.amount}</Text>
            </View>
          </View>

          {/* 每筆交易的底部分隔線 */}
          <View style={styles.lightSeparator} />
        </Swipeable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 8,
    backgroundColor: 'white',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5a623',
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 8,
  },
  txItem: {
    fontSize: 16,
    marginLeft: 12,
  },
  lightSeparator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
  signlelineTransacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txRight: {},
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
  },
});
