import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Transaction} from '../../types/transaction';

interface Props {
  date: string;
  transactions: Transaction[];
}

export const TransactionGroup = ({date, transactions}: Props) => {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.groupContainer}>
      <View style={styles.groupHeader}>
        <Text style={styles.dateLabel}>{date}</Text>
        <Text style={styles.totalAmount}>${totalAmount}</Text>
      </View>
      <View style={styles.separator} />
      {transactions.map((tx, index) => (
        <View key={tx.id}>
          <View style={styles.signlelineTransacion}>
            <View style={styles.txLeft}>
              <Text style={styles.txItem}>{tx.icon}</Text>
              <Text style={styles.txItem}>{tx.remark}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txItem}>${tx.amount}</Text>
            </View>
          </View>
          {index < transactions.length - 1 && (
            <View style={styles.lightSeparator} />
          )}
        </View>
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
  },
  txRight: {},
  txLeft: {
    flexDirection: 'row',
  },
});
