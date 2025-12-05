import { db } from "../db";

export async function exportDataToCSV() {
  const accounts = await db.accounts.toArray();
  const transactions = await db.transactions.toArray();
  const tags = await db.tags.toArray();

  const data = {
    accounts,
    transactions,
    tags
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `budgt-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDataFromJSON(file: File) {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    if (data.accounts) await db.accounts.bulkPut(data.accounts);
    if (data.transactions) await db.transactions.bulkPut(data.transactions);
    if (data.tags) await db.tags.bulkPut(data.tags);
    return true;
  } catch (e) {
    console.error("Failed to import data", e);
    return false;
  }
}
