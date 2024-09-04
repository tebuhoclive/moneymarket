import { IDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";

export function DepositDuplicates(transactions: IDepositTransaction[], transaction: IDepositTransaction) {
    // Check if there are any transactions
    if (transactions.length > 0) {
        // Iterate over allTransactions array
        for (const t of transactions) {
            // Check if allocation, description, amount, and source of funds match
            if (t.statementIdentifier === transaction.statementIdentifier) {
                // If match found, return true
                return true;
            }
        }
    }
    // If no match found or no transactions exist, return false
    return false;
}
export function FlagOutPossibleDuplicatesWithdrawals(transactions: IWithdrawalTransaction[], transaction: IWithdrawalTransaction) {
    // Check if there are any transactions
    if (transactions.length > 0) {
        // Iterate over allTransactions array
        for (const t of transactions) {
            // Check if allocation, description, amount, and source of funds match
            if (t.accountNumber === transaction.accountNumber &&
                t.amount === transaction.amount &&
                new Date(t.transactionDate || 0).getDate === new Date(Date.now()).getDate
            ) {
                // If match found, return true
                return true;
            }
        }
    }
    // If no match found or no transactions exist, return false
    return false;
}
export function SplitDepositDuplicates(existingTransactions: IDepositTransaction[], mainTransactionId: string, splitTransactions: IDepositTransaction[]): boolean {
    return splitTransactions.some(splitTransaction =>
        existingTransactions.some(existingTransaction =>
            existingTransaction.statementIdentifier === splitTransaction.statementIdentifier &&
            existingTransaction.parentTransaction === mainTransactionId
        )
    );
}

export function SplitWithdrawalDuplicates(existingTransactions: IWithdrawalTransaction[], mainTransactionId: string, splitTransactions: IWithdrawalTransaction[]): boolean {
    return splitTransactions.some(splitTransaction =>
        existingTransactions.some(existingTransaction =>
            // existingTransaction.statementIdentifier === splitTransaction.statementIdentifier &&
            existingTransaction.parentTransaction === mainTransactionId
        )
    );
}
