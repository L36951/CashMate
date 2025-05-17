import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface IncomeExpenseToggleProps {
  setType: (type: 'income' | 'expense') => void;
  type: string;
}

export const IncomeExpenseToggle = ({
  setType,
  type,
}: IncomeExpenseToggleProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.center}>
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              type === 'expense' && styles.expenseSelected,
            ]}
            onPress={() => {
              setType('expense');
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
            }}>
            <Text style={styles.toggleText}>收入</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    position: 'relative',
  },
  center: {
    flex: 1,
    alignItems: 'center',
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
  expenseSelected: {backgroundColor: '#ffd700', borderColor: '#aaa'},
  toggleText: {
    fontSize: 16,
  },
  incomeSelected: {
    borderColor: '#aaa',
    backgroundColor: '#3EC1F3',
  },
});
