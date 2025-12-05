import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { addAccount, updateAccount, deleteAccount, addTransaction, updateTransaction, deleteTransaction } from '../hooks/use-db';

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

    // Dexie returns the key, which is a number for ++id
    const account = await db.accounts.get(Number(id));
    expect(account).toBeDefined();
    expect(account?.name).toBe('Test Account');
  });

  it('should update an account', async () => {
    const id = await addAccount({
      name: 'Test Account',
      type: 'SAVINGS',
      balance: 1000,
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await updateAccount(Number(id), { name: 'Updated Account', balance: 2000 });
    const account = await db.accounts.get(Number(id));
    expect(account?.name).toBe('Updated Account');
    expect(account?.balance).toBe(2000);
  });

  it('should delete an account', async () => {
    const id = await addAccount({
      name: 'Delete Me',
      type: 'CASH',
      balance: 50,
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await deleteAccount(Number(id));
    const account = await db.accounts.get(Number(id));
    expect(account).toBeUndefined();
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
        accountId: String(accountId),
        amount: 500,
        type: 'INCOME',
        category: 'Salary',
        tags: [],
        description: 'Paycheck',
        date: Date.now(),
        createdAt: Date.now()
    });

    let account = await db.accounts.get(Number(accountId));
    expect(account?.balance).toBe(1500);

    // Add Expense
    await addTransaction({
        accountId: String(accountId),
        amount: 200,
        type: 'EXPENSE',
        category: 'Food',
        tags: [],
        description: 'Groceries',
        date: Date.now(),
        createdAt: Date.now()
    });

    account = await db.accounts.get(Number(accountId));
    expect(account?.balance).toBe(1300);
  });

  it('should update a transaction and revert/apply balance changes', async () => {
      const accountId = await addAccount({
          name: 'Test Account',
          type: 'SAVINGS',
          balance: 1000,
          currency: 'USD',
          createdAt: Date.now(),
          updatedAt: Date.now()
      });

      // Original Transaction: Expense of 200 -> Balance 800
      const txId = await addTransaction({
          accountId: String(accountId),
          amount: 200,
          type: 'EXPENSE',
          category: 'Food',
          tags: [],
          description: 'Original',
          date: Date.now(),
          createdAt: Date.now()
      });

      let account = await db.accounts.get(Number(accountId));
      expect(account?.balance).toBe(800);

      // Update Transaction: Changed to Expense of 300 -> Revert 200 (1000), Apply 300 -> Balance 700
      await updateTransaction(Number(txId), { amount: 300 });

      account = await db.accounts.get(Number(accountId));
      expect(account?.balance).toBe(700);

      // Update Transaction: Change Type to INCOME of 300 -> Revert Expense 300 (1000), Apply Income 300 -> Balance 1300
      await updateTransaction(Number(txId), { type: 'INCOME' });
      account = await db.accounts.get(Number(accountId));
      expect(account?.balance).toBe(1300);
  });

  it('should delete a transaction and revert balance', async () => {
      const accountId = await addAccount({
          name: 'Test Account',
          type: 'SAVINGS',
          balance: 1000,
          currency: 'USD',
          createdAt: Date.now(),
          updatedAt: Date.now()
      });

      // Expense of 200 -> Balance 800
      const txId = await addTransaction({
          accountId: String(accountId),
          amount: 200,
          type: 'EXPENSE',
          category: 'Food',
          tags: [],
          description: 'Delete Me',
          date: Date.now(),
          createdAt: Date.now()
      });

      let account = await db.accounts.get(Number(accountId));
      expect(account?.balance).toBe(800);

      await deleteTransaction(Number(txId));

      account = await db.accounts.get(Number(accountId));
      expect(account?.balance).toBe(1000);

      const tx = await db.transactions.get(Number(txId));
      expect(tx).toBeUndefined();
  });
});
