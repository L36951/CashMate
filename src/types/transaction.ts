export interface Transaction {
  id: string;
  icon:string;
  remark: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface GroupedTransactions {
  [date: string]: Transaction[];
}

