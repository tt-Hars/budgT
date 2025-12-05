import type { Meta, StoryObj } from '@storybook/react';
import { TransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/TransactionDialog',
  component: TransactionDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TransactionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TransactionDialog />,
};

export const WithCustomTrigger: Story = {
    render: () => (
        <TransactionDialog>
            <Button variant="secondary">Add Expense</Button>
        </TransactionDialog>
    )
};

export const EditMode: Story = {
    args: {
        transaction: {
            id: 1,
            accountId: "1",
            amount: 45.50,
            type: 'EXPENSE',
            category: 'Dining',
            description: 'Lunch',
            tags: ['food'],
            date: Date.now(),
            createdAt: Date.now()
        },
        open: true
    },
     render: (args) => (
         <div className="h-[600px] w-[500px]">
            <TransactionDialog {...args} />
         </div>
    )
};
