import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface BackupSelectorProp {
  backups: {id: string; name: string}[];
  handleDownload: (fileId: string, fileName: string) => {};
  setShowBackupList: (showBackupList: boolean) => void;
}
export const BackupSelector = ({
  backups,
  handleDownload,
  setShowBackupList,
}: BackupSelectorProp) => {
  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>選擇一個備份還原：</Text>

        <ScrollView contentContainerStyle={{alignItems: 'center'}}>
          {backups.map(file => (
            <TouchableOpacity
              key={file.id}
              style={styles.backupItem}
              onPress={() => handleDownload(file.id, file.name)}>
              <Text>{file.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.modalCancel}
          onPress={() => setShowBackupList(false)}>
          <Text style={{color: 'red', marginTop: 12, fontSize: 16}}>取消</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '80%',
    height: '80%',
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  backupItem: {
    paddingVertical: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  modalCancel: {
    marginTop: 8,
  },
});
