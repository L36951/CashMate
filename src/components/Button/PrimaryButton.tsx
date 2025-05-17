import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
export const PrimaryButton = ({
  label,
  icon,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} disabled={disabled}>
    {loading ? (
      <ActivityIndicator color="#fff" style={{marginRight: 8}} />
    ) : (
      <Icon name={icon} size={20} style={styles.btnIcon} />
    )}
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  btn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  btnIcon: {color: '#fff', marginRight: 8},
  btnText: {color: '#fff', fontSize: 15, fontWeight: '600'},
});
