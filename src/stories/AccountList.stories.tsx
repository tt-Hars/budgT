import type { Meta, StoryObj } from '@storybook/react';
import { AccountListView } from '@/components/accounts/account-list';

const meta = {
  title: 'Features/AccountList',
  component: AccountListView,
  tags: ['autodocs'],
} satisfies Meta<typeof AccountListView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAccounts: any[] = [
  {
    id: '1',
    name: 'Main Savings',
    type: 'SAVINGS',
    balance: 5000,
    currency: 'USD',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    name: 'Chase Sapphire',
    type: 'CREDIT_CARD',
    balance: -120.50,
    currency: 'USD',
    creditCardDetails: {
        limit: 10000,
        billingDay: 1,
        dueDay: 20
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    name: 'Cash Wallet',
    type: 'WALLET',
    balance: 50,
    currency: 'USD',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const Default: Story = {
  args: {
    accounts: mockAccounts
  }
};

export const Empty: Story = {
  args: {
    accounts: []
  }
};
