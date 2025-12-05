import type { Meta, StoryObj } from '@storybook/react';
import { DashboardOverviewView } from '@/components/dashboard/overview';

const meta = {
  title: 'Features/DashboardOverview',
  component: DashboardOverviewView,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardOverviewView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAccounts: any[] = [
  { id: '1', balance: 5000 },
  { id: '2', balance: -150 },
  { id: '3', balance: 100 }
];

export const Default: Story = {
  args: {
    accounts: mockAccounts
  }
};

export const ZeroBalance: Story = {
  args: {
    accounts: []
  }
};
