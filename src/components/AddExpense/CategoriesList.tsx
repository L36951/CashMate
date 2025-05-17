import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  expenseCategoriesInterface,
  incomeCategoriesInterface,
} from '../../types/categoryType';

interface CategoriesListProps {
  setIcon: (icon: string) => void;
  setCategory: (category: string) => void;
  setRemark: (remark: string) => void;

  type: 'income' | 'expense';
  incomeCategories: expenseCategoriesInterface[];
  expenseCategories: incomeCategoriesInterface[];
  numColumns?: number;
  navigation?: any;
}

export const CategoriesList = ({
  type,

  setIcon,
  setCategory,
  setRemark,

  incomeCategories,
  expenseCategories,
  numColumns = 4,
  navigation,
}: CategoriesListProps) => {
  const displayedCategories = [
    {isAddButton: true}, // 🔥 第一個是新增按鈕
    ...(type === 'income' ? incomeCategories : expenseCategories),
  ];
  function padCategories(data: any[], columns: number) {
    const fullRows = Math.floor(data.length / columns);
    let lastRowCount = data.length - fullRows * columns;
    while (lastRowCount !== 0 && lastRowCount < columns) {
      data.push({empty: true});
      lastRowCount++;
    }
    return data;
  }

  return (
    <FlatList
      data={padCategories(displayedCategories, numColumns)}
      keyExtractor={(item, index) => index.toString()}
      numColumns={numColumns}
      renderItem={({item}) =>
        item.empty ? (
          <View style={styles.iconPlaceholder} />
        ) : item.isAddButton ? ( // 🔥 新增分類按鈕
          <TouchableOpacity
            style={[styles.iconButton]}
            onPress={() => navigation.navigate('AddCategory')}>
            <Text style={styles.addLogo}>➕</Text>
            <Text style={styles.addText}>新增</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.iconButton,
              type === 'income'
                ? styles.incomeBackGround
                : styles.expenseBackGround,
            ]}
            onPress={() => {
              setCategory(item.category);
              setRemark(item.defaultRemark);
              setIcon(item.icon);
            }}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text>{item.defaultRemark}</Text>
          </TouchableOpacity>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  iconPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    backgroundColor: 'transparent',
  },
  iconButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '22%', // 控制最多 4 個一行
  },
  icon: {
    fontSize: 28,
  },
  incomeBackGround: {
    backgroundColor: '#87CEFA',
  },
  expenseBackGround: {
    backgroundColor: '#FFC23C',
  },
  addLogo: {
    fontSize: 32,
  },
  addText: {
    fontSize: 12,
  },
});
