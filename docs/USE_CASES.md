# Use Cases

## 1. Account Management
- **Add Account**: User can add a new account (Savings, Credit Card, Wallet).
  - For Credit Cards, user must prompt for Billing Cycle (Statement Date, Due Date).
- **Edit Account**: User can rename or update details.
- **Delete Account**: Soft delete or hard delete (checking for existing transactions).

## 2. Transaction Management
- **Log Expense**: User enters amount, selects account, adds tags, description.
  - If Credit Card, it adds to the outstanding balance.
- **Log Income**: User adds money to an account.
- **Transfer**: Move money from one account to another (e.g., Paying off Credit Card from Savings).

## 3. Credit Card Management
- **View Status**: See current outstanding balance, next due date.
- **Pay Bill**: Shortcut to create a transfer transaction from a bank account to the credit card account to clear balance.

## 4. Analysis
- **Filter by Tag**: View expenses by specific tags.
- **Export**: Export all data to CSV for backup.
- **Import**: Restore data from CSV.

## 5. Offline & PWA
- **Offline Access**: App loads and functions without internet. Data syncs (locally) and persists.
- **Install**: User can install app to home screen.
