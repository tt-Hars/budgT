import { useLiveQuery } from "dexie-react-hooks";
import { db, type Account, type Transaction } from "../db";

export function useAccounts() {
  return useLiveQuery(() => db.accounts.toArray());
}

export function useTransactions(accountId?: string) {
  return useLiveQuery(() => {
    if (accountId) {
      return db.transactions.where('accountId').equals(accountId).reverse().sortBy('date');
    }
    return db.transactions.orderBy('date').reverse().toArray();
  });
}

export async function addAccount(account: Omit<Account, 'id'>) {
  return await db.accounts.add(account);
}

export async function updateAccount(id: number, changes: Partial<Account>) {
  return await db.accounts.update(id, changes);
}

export async function deleteAccount(id: number) {
  return await db.transaction('rw', db.accounts, db.transactions, async () => {
    await db.accounts.delete(id);
    // Also delete related transactions or handle them?
    // For now, let's just delete the transactions associated with this account to avoid orphans.
    await db.transactions.where('accountId').equals(String(id)).delete();
    // Note: If this account was a destination for transfers, those transactions remain but point to nowhere.
    // Ideally we should find transfers TO this account and revert/delete, but that's complex.
    // Keeping it simple for now: delete transactions owned by this account.
  });
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
  return await db.transaction('rw', db.accounts, db.transactions, async () => {
    // Add the transaction
    await db.transactions.add(transaction);

    // Update account balance
    const account = await db.accounts.get(Number(transaction.accountId));
    if (!account) throw new Error("Account not found");

    let newBalance = account.balance;
    if (transaction.type === 'INCOME') {
      newBalance += transaction.amount;
    } else if (transaction.type === 'EXPENSE') {
      newBalance -= transaction.amount;
    } else if (transaction.type === 'TRANSFER' && transaction.transferToAccountId) {
       newBalance -= transaction.amount;
       // Handle destination account
       const destAccount = await db.accounts.get(Number(transaction.transferToAccountId));
       if(destAccount) {
         await db.accounts.update(Number(transaction.transferToAccountId), {
           balance: destAccount.balance + transaction.amount
         });
       }
    }

    await db.accounts.update(Number(transaction.accountId), { balance: newBalance });
  });
}

export async function updateTransaction(id: number, changes: Partial<Transaction>) {
  // This is tricky because changing amount/type/account requires reverting the old balance impact and applying the new one.
  // For simplicity, we can fetch the old transaction, revert its effect, then apply the new transaction effect.

  return await db.transaction('rw', db.accounts, db.transactions, async () => {
    const oldTransaction = await db.transactions.get(id);
    if (!oldTransaction) throw new Error("Transaction not found");

    // Revert old transaction effect
    const oldAccount = await db.accounts.get(Number(oldTransaction.accountId));
    if (oldAccount) {
       let revertedBalance = oldAccount.balance;
       if (oldTransaction.type === 'INCOME') {
         revertedBalance -= oldTransaction.amount;
       } else if (oldTransaction.type === 'EXPENSE') {
         revertedBalance += oldTransaction.amount;
       } else if (oldTransaction.type === 'TRANSFER' && oldTransaction.transferToAccountId) {
         revertedBalance += oldTransaction.amount;
         const oldDestAccount = await db.accounts.get(Number(oldTransaction.transferToAccountId));
         if (oldDestAccount) {
            await db.accounts.update(Number(oldTransaction.transferToAccountId), {
              balance: oldDestAccount.balance - oldTransaction.amount
            });
         }
       }
       await db.accounts.update(Number(oldTransaction.accountId), { balance: revertedBalance });
    }

    // Prepare new transaction data
    const newTransaction = { ...oldTransaction, ...changes };

    // Apply new transaction effect
    const newAccount = await db.accounts.get(Number(newTransaction.accountId));
    if (!newAccount) throw new Error("New account not found"); // Should not happen if accountId didn't change or is valid

    let newBalance = newAccount.balance;
     if (newTransaction.type === 'INCOME') {
      newBalance += newTransaction.amount;
    } else if (newTransaction.type === 'EXPENSE') {
      newBalance -= newTransaction.amount;
    } else if (newTransaction.type === 'TRANSFER' && newTransaction.transferToAccountId) {
       newBalance -= newTransaction.amount;
       // Handle destination account
       const destAccount = await db.accounts.get(Number(newTransaction.transferToAccountId));
       if(destAccount) {
         await db.accounts.update(Number(newTransaction.transferToAccountId), {
           balance: destAccount.balance + newTransaction.amount
         });
       }
    }

    await db.accounts.update(Number(newTransaction.accountId), { balance: newBalance });
    await db.transactions.update(id, changes);
  });
}

export async function deleteTransaction(id: number) {
  return await db.transaction('rw', db.accounts, db.transactions, async () => {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;

    // Revert balance
    const account = await db.accounts.get(Number(transaction.accountId));
    if (account) {
       let revertedBalance = account.balance;
       if (transaction.type === 'INCOME') {
         revertedBalance -= transaction.amount;
       } else if (transaction.type === 'EXPENSE') {
         revertedBalance += transaction.amount;
       } else if (transaction.type === 'TRANSFER' && transaction.transferToAccountId) {
         revertedBalance += transaction.amount;
         const destAccount = await db.accounts.get(Number(transaction.transferToAccountId));
         if (destAccount) {
            await db.accounts.update(Number(transaction.transferToAccountId), {
              balance: destAccount.balance - transaction.amount
            });
         }
       }
       await db.accounts.update(Number(transaction.accountId), { balance: revertedBalance });
    }

    await db.transactions.delete(id);
  });
}
