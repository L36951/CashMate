import React from 'react';
import Svg, {G, Path} from 'react-native-svg';
import * as d3 from 'd3-shape';
import {View, Text, StyleSheet} from 'react-native';

type Props = {
  income: number;
  expense: number;
  radius?: number;
  strokeWidth?: number;
  borderWidth?: number;
};

export const DonutChart = ({
  income,
  expense,
  radius = 80,
  strokeWidth = 60,
  borderWidth = 2,
}: Props) => {
  const center = radius + strokeWidth + 1;
  const total = income + expense;
  const incomeRatio = total > 0 ? (income / total) * 100 : 50;
  const hasBothSides = income > 0 && expense > 0;
  const pad = hasBothSides ? 0.03 : 0;

  const arcGenInc = d3
    .arc()
    .innerRadius(radius)
    .outerRadius(radius + strokeWidth)
    .startAngle(0 + pad)
    .endAngle((incomeRatio / 100) * 2 * Math.PI - pad);

  const arcGenExp = d3
    .arc()
    .innerRadius(radius)
    .outerRadius(radius + strokeWidth)
    .startAngle((incomeRatio / 100) * 2 * Math.PI + pad)
    .endAngle(2 * Math.PI - pad);

  const incomePath = arcGenInc({} as any);
  const expensePath = arcGenExp({} as any);

  return (
    <View style={styles.container}>
      <Svg width={center * 2} height={center * 2}>
        <G x={center} y={center}>
          {incomePath && (
            <Path
              d={incomePath}
              fill="#3EC1F3"
              stroke="#000"
              strokeWidth={borderWidth}
            />
          )}
          {expensePath && (
            <Path
              d={expensePath}
              fill="#FFC23C"
              stroke="#000"
              strokeWidth={borderWidth}
            />
          )}
        </G>
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.label}>月結餘</Text>
        <Text style={styles.value}>${(income - expense).toFixed(0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
