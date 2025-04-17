import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  onPress: (value: string) => void;
  onDelete: () => void;
}

export const NumericKeyboard = ({onPress, onDelete}: Props) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View style={styles.row} key={rowIndex}>
          {row.map(key => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => {
                if (key === '⌫') onDelete();
                else onPress(key);
              }}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  key: {
    width: 80,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
