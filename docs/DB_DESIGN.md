# Database Design

## IndexedDB Schema

We will use `dexie.js` to manage IndexedDB. The database name will be `BudgTDB`.

### Tables

#### 1. Accounts
Stores information about different financial accounts.

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Primary Key |
| `name` | string | Name of the account (e.g., "Chase Sapphire", "Savings") |
| `type` | string | Enum: `SAVINGS`, `CHECKING`, `CREDIT_CARD`, `WALLET`, `CASH` |
| `balance` | number | Current balance (for credit cards, this is usually negative or tracked separately) |
| `currency` | string | ISO currency code (default: USD) |
| `creditCardDetails` | object (optional) | Specific details for credit cards |
| `creditCardDetails.billingDay` | number | Day of month statement is generated |
| `creditCardDetails.dueDay` | number | Day of month payment is due |
| `creditCardDetails.limit` | number | Credit limit |
| `createdAt` | number | Timestamp |
| `updatedAt` | number | Timestamp |

#### 2. Transactions
Stores all financial transactions.

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Primary Key |
| `accountId` | string | Foreign Key to Accounts |
| `amount` | number | Transaction amount (positive for income, negative for expense) |
| `type` | string | Enum: `INCOME`, `EXPENSE`, `TRANSFER` |
| `category` | string | General category |
| `tags` | string[] | Array of tag IDs or names |
| `description` | string | Transaction note |
| `date` | number | Date of transaction (timestamp) |
| `transferToAccountId` | string (optional) | If transfer, destination account ID |
| `createdAt` | number | Timestamp |

#### 3. Tags
Stores user-defined tags for better categorization.

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Primary Key |
| `name` | string | Tag name (e.g., "Food", "Travel") |
| `color` | string | Hex color code |

#### 4. Budgets (Future Scope)
To track spending limits.

## Splitwise Extension (Future Scope)
To support the future "Splitwise" like feature, we will likely need:

#### Users/Peers
| Field | Type | Description |
|---|---|---|
| `id` | string | PK |
| `name` | string | Name of the friend |

#### Expenses (Split)
We might extend the `Transactions` table or create a separate `SharedExpenses` table that links to `Transactions`.
