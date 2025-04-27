import SQLite from 'react-native-sqlite-2';
import { Transaction,GroupedTransactions } from '../types/transaction';

const db = SQLite.openDatabase('cashmate.db', '1.0', '', 1);

// create table
export const createTable =()=>{
    db.transaction((tx)=>{
        tx.executeSql(`
            CREATE TABLE IF NOT EXISTS transactions(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                remark TEXT NOT NULL,
                icon TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL
            );
        `);
    });
};
export const dropTransactionTableAsync = (): Promise<void>=>{
  return new Promise((resolve,reject)=>{
    db.transaction((tx)=>{
      tx.executeSql('DROP TABLE IF EXISTS transactions',
        [],
        ()=>{
          console.log('✅ transactions 表已刪除');
          createTable();
          resolve();
        },
        (_,error)=>{
          console.error('❌ 刪除 transactions 表失敗', error);
          reject(error);
          return true;
        }
      )
    })
  })
}
// add transaction
export const insertTransaction = (txData:Omit<Transaction, 'id'>)=>{
    const {remark, amount, type, category, date, icon} = txData;
    db.transaction((tx)=>{
        tx.executeSql(`
            INSERT INTO transactions(title, amount, type, category, date, icon) VALUES (?,?,?,?,?,?)`, [remark, amount, type, category, date,icon]
        )
    })
}

// get all transactions
export const getAllTransactions = (callback: (results:Transaction[])=> void)=>{
    db.transaction((tx)=>{
        tx.executeSql('SELECT * FROM transactions ORDER BY DATE DESC',[],(tx, results)=>{
            const rows:Transaction[]=[];
            for (let i = 0; i < results.rows.length; i++){
                rows.push(results.rows.item(i));
            }
            callback(rows);
        });

    });
}

// ✅ 新增交易（async/await 寫法）
export const insertTransactionAsync = (txData: Omit<Transaction, 'id'>): Promise<void> => {
    const { remark, amount, type, category, date,icon } = txData;
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO transactions (remark, amount, type, category, date,icon) VALUES (?, ?, ?, ?, ?,?)',
          [remark, amount, type, category, date,icon],
          () => resolve(),
          (_, error) => {
            console.log('something wrong')
            reject(error);
            return true;
          }
        );
      });
    });
  };

// ✅ 查詢所有交易（async/await 寫法）
export const getAllTransactionsAsync = (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM transactions ORDER BY date DESC, id DESC`,
          [],
          (tx, results) => {
            const rows: Transaction[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };
  export const getTransactionsByMonth = (month:string): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      console.log(month)
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC, id DESC`,
          [month],
          (tx, results) => {
            const rows: Transaction[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };
  // ✅ 清除所有交易（async/await）
export const clearAllTransactionsAsync = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM transactions`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  };

  export const groupByDate = (transactions: Transaction[]): GroupedTransactions => {
    
    return transactions.reduce((groups, tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
      return groups;
    }, {} as GroupedTransactions);
  };

  
export const getDBConnection = async () => {
  return SQLite.openDatabase('cashmate.db', '1.0', '', 1);
};
  export const deleteTransactionByIdAsync = async (id: string): Promise<void> => {
    const db = await getDBConnection();
  
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            'DELETE FROM transactions WHERE id = ?;',
            [id],
            (_, result) => {
              console.log('✅ 成功刪除交易 id:', id);
              resolve();
            },
            (_, error) => {
              console.error('❌ 刪除交易失敗:', error);
              reject(error);
              return true; // 重要！告訴 transaction 停止
            }
          );
        },
        error => {
          console.error('❌ transaction error 刪除交易:', error);
          reject(error);
        }
      );
    });
  };
  