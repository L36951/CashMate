import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';

interface MonthSelectorProps {
  selectedYear: string;
  selectedMonth: string;
  onSelect: (year: string, month: string) => void;
}

const months = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onSelect,
}) => {
  const [visible, setVisible] = useState(false);
  const [tempYear, setTempYear] = useState(parseInt(selectedYear));
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const handleMonthPress = (month: string) => {
    setTempMonth(month);
    onSelect(tempYear.toString(), month);
  };
  useEffect(() => {
    onSelect(tempYear.toString(), tempMonth);
  }, [tempYear]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.displayBtn}>
        <Text style={styles.displayText}>
          {selectedYear}-{selectedMonth}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.yearRow}>
              <TouchableOpacity onPress={() => setTempYear(tempYear - 1)}>
                <Text style={styles.arrow}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.yearText}>{tempYear}</Text>
              <TouchableOpacity onPress={() => setTempYear(tempYear + 1)}>
                <Text style={styles.arrow}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {months.map(month => (
                <TouchableOpacity
                  key={month}
                  style={styles.monthBox}
                  onPress={() => handleMonthPress(month)}>
                  <Text style={styles.monthLabel}>{month}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>關閉</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  displayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  displayText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: 180,
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  yearText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monthBox: {
    width: '22%',
    aspectRatio: 1,
    margin: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
  },
  closeText: {
    fontSize: 16,
    color: '#333',
    padding: 8,
  },
});
