import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { addAccount, addTransaction } from '../hooks/use-db';

describe('Database Logic', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('should add an account', async () => {
    const id = await addAccount({
      name: 'Test Account',
      type: 'SAVINGS',
      balance: 1000,
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const account = await db.accounts.get(id);
    expect(account).toBeDefined();
    expect(account?.name).toBe('Test Account');
  });

  it('should add a transaction and update balance', async () => {
    const accountId = await addAccount({
      name: 'Test Account',
      type: 'SAVINGS',
      balance: 1000,
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Add Income
    await addTransaction({
        accountId: accountId as string,
        amount: 500,
        type: 'INCOME',
        category: 'Salary',
        tags: [],
        description: 'Paycheck',
        date: Date.now(),
        createdAt: Date.now()
    });

    let account = await db.accounts.get(accountId);
    expect(account?.balance).toBe(1500);

    // Add Expense
    await addTransaction({
        accountId: accountId as string,
        amount: 200,
        type: 'EXPENSE',
        category: 'Food',
        tags: [],
        description: 'Groceries',
        date: Date.now(),
        createdAt: Date.now()
    });

    account = await db.accounts.get(accountId);
    expect(account?.balance).toBe(1300);
  });
});
