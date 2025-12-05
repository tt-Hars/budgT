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
