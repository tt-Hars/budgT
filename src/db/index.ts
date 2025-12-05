import Dexie, { type Table } from 'dexie';

export type AccountType = 'SAVINGS' | 'CHECKING' | 'CREDIT_CARD' | 'WALLET' | 'CASH';

export interface Account {
  id?: number;
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
  id?: number;
  accountId: string; // References Account.id (as string for now to match forms?) Or number? Form uses string. Let's keep foreign keys as string for now to avoid massive refactor, but primary keys as number.
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
  id?: number;
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
