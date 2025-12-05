import type { Meta, StoryObj } from '@storybook/react';
import { AccountDialog } from '@/components/accounts/add-account-dialog';
import { Button } from '@/components/ui/button';

// Mock DB hooks via decorator or just rely on them failing gracefully if not mocked?
// Since use-db imports live db, it might try to open IndexedDB.
// Storybook runs in browser so IndexedDB is available.
// However, the hooks use `useLiveQuery`.

const meta = {
  title: 'Components/AccountDialog',
  component: AccountDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccountDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AccountDialog />,
};

export const WithCustomTrigger: Story = {
    render: () => (
        <AccountDialog>
            <Button variant="secondary">Custom Trigger</Button>
        </AccountDialog>
    )
};

export const EditMode: Story = {
    args: {
        account: {
            id: 1,
            name: 'Existing Savings',
            type: 'SAVINGS',
            balance: 5000,
            currency: 'USD',
            createdAt: Date.now(),
            updatedAt: Date.now()
        },
        open: true
    },
    render: (args) => (
         <div className="h-[600px] w-[500px]">
             {/* Force open to show content, though Dialog/Drawer might need interactive play */}
            <AccountDialog {...args} />
         </div>
    )
};
