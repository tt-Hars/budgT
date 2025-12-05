import type { Meta, StoryObj } from '@storybook/react';
import { TransactionListView } from '@/components/transactions/transaction-list';

const meta = {
  title: 'Features/TransactionList',
  component: TransactionListView,
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionListView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAccounts: any[] = [
  { id: '1', name: 'Savings', currency: 'USD' },
  { id: '2', name: 'Credit Card', currency: 'USD' }
];

const mockTransactions: any[] = [
    {
        id: '1',
        accountId: '1',
        amount: 2500,
        type: 'INCOME',
        category: 'Salary',
        description: 'Paycheck',
        date: Date.now(),
        tags: [],
        createdAt: Date.now()
    },
    {
        id: '2',
        accountId: '2',
        amount: 50.25,
        type: 'EXPENSE',
        category: 'Food',
        description: 'Grocery Store',
        date: Date.now() - 86400000,
        tags: [],
        createdAt: Date.now()
    },
    {
        id: '3',
        accountId: '1',
        transferToAccountId: '2',
        amount: 100,
        type: 'TRANSFER',
        category: 'Transfer',
        description: 'Pay Bill',
        date: Date.now() - 172800000,
        tags: [],
        createdAt: Date.now()
    }
];

export const Default: Story = {
  args: {
    transactions: mockTransactions,
    accounts: mockAccounts
  }
};

export const Empty: Story = {
  args: {
    transactions: [],
    accounts: mockAccounts
  }
};
