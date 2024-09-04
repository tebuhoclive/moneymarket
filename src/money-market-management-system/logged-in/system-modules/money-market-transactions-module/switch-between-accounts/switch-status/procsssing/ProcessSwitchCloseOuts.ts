import AppApi from "../../../../../../../shared/apis/AppApi";
import { onReAlign } from "../../../../../../../shared/functions/transactions/CorrectionsOnStatement";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { ISwitchTransaction } from "../../../../../../../shared/models/SwitchTransactionModel";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";

export async function processSwitchCloseOuts(
    transaction: ISwitchTransaction,
    accountFrom: IMoneyMarketAccount,
    accountTo: IMoneyMarketAccount,
    api: AppApi
) {
    try {
        const currentDate = Date.now();
        const formattedDate = Date.parse(dateFormat_YY_MM_DD(transaction.valueDate));

        // Calculate new balances
        const mmaNewBalanceAfterCapitalisation = accountFrom.balance + (transaction.closeOutInterest || 0);
        const mmaNewAccountBalanceFrom = accountFrom.balance - transaction.amount;
        const mmaNewAccountBalanceTo = accountTo.balance + transaction.amount;


        // Create capitalisation transaction for "from" account
        if (transaction.closeOutInterest) {
            const capitaliseStatementTransaction: IStatementTransaction = {
                id: `${transaction.id}ccc`,
                date: formattedDate,
                transaction: "deposit",
                amount: transaction.closeOutInterest,
                balance: mmaNewBalanceAfterCapitalisation,
                previousBalance: accountFrom.balance,
                rate: accountFrom.clientRate,
                remark: transaction.reference,
                createdAt: currentDate,
                fromAccountId: accountFrom.id,
                toAccountId: accountTo.id
            };

            await api.mma.createStatementTransaction(accountFrom.id, capitaliseStatementTransaction);
        }

        // Create withdrawal transaction for "from" account
        const statementTransactionFrom: IStatementTransaction = {
            id: transaction.id,
            date: formattedDate,
            transaction: "withdrawal",
            amount: transaction.amount,
            balance: mmaNewAccountBalanceFrom,
            previousBalance: accountFrom.balance,
            rate: accountFrom.clientRate,
            remark: transaction.reference,
            createdAt: currentDate,
            fromAccountId: accountFrom.id,
            toAccountId: accountTo.id
        };

        await api.mma.createStatementTransaction(accountFrom.id, statementTransactionFrom);

        // Create deposit transaction for "to" account
        const statementTransactionTo: IStatementTransaction = {
            id: transaction.id,
            date: formattedDate,
            transaction: "deposit",
            amount: transaction.amount,
            balance: mmaNewAccountBalanceTo,
            rate: accountTo.clientRate,
            remark: transaction.reference,
            createdAt: currentDate,
            fromAccountId: accountFrom.id,
            toAccountId: accountTo.id
        };

        await api.mma.createStatementTransaction(accountTo.id, statementTransactionTo);
        await onReAlign(accountFrom.id);
        await onReAlign(accountTo.id);
    } catch (error) {
        console.error(`Error processing switch closeouts: ${error}`);
        throw error; // Re-throw the error after logging it
    }
}