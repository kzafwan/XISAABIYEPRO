
export interface MatchedTransaction {
  date: string;
  reference: string;
  amount: number;
}

export interface AccountBreakdown {
  accountNumber: string;
  amountSent: number;
}

export interface UserSummary {
  userId: string;
  userName: string;
  phoneNumber?: string;
  totalOwed: number;
  totalSent: number;
  balance: number;
  accountBreakdown: AccountBreakdown[];
  matchedTransactions: MatchedTransaction[]; // New drill-down data
}

export interface UnknownAccount {
  accountNumber: string;
  date: string;
  amount: number;
  transactionRef: string;
}

export interface AuditResults {
  userSummaries: UserSummary[];
  missingPayments: string[];
  unknownAccounts: UnknownAccount[];
  summaryNote: string;
}

export interface FileState {
  file: File | null;
  base64: string | null;
  status: 'empty' | 'loading' | 'ready';
}

export type FileType = 'registry' | 'earnings' | 'statement';
