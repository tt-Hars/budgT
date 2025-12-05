import Dexie, { type Table } from 'dexie';

export type AccountType = 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'WALLET' | 'CASH';

export interface Account {
  id?: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  creditCardDetails?: {
    billingDay: number;
    dueDay: number;
    limit: number;
  };
  createdAt: number;
  updatedAt: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id?: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  tags: string[]; // Store as array of strings for simplicity now
  description: string;
  date: number;
  transferToAccountId?: string;
  createdAt: number;
}

export interface Tag {
  id?: string;
  name: string;
  color: string;
}

export class BudgTDatabase extends Dexie {
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  tags!: Table<Tag>;

  constructor() {
    super('BudgTDB');
    this.version(1).stores({
      accounts: '++id, name, type',
      transactions: '++id, accountId, type, date, [tags]',
      tags: '++id, &name'
    });
  }
}

export const db = new BudgTDatabase();
