import AppApi from "../../../../../../../shared/apis/AppApi";
import { onReAlign } from "../../../../../../../shared/functions/transactions/CorrectionsOnStatement";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { ISwitchTransaction } from "../../../../../../../shared/models/SwitchTransactionModel";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";

export async function processNormalSwitch(
    transaction: ISwitchTransaction,
    accountFrom: IMoneyMarketAccount,
    accountTo: IMoneyMarketAccount,
    api: AppApi
) {
    const currentDate = Date.now();
    const formattedDate = Date.parse(dateFormat_YY_MM_DD(transaction.valueDate));

    // Calculate new balances
    const mmaNewAccountBalanceFrom = accountFrom.balance - transaction.amount;
    const mmaNewAccountBalanceTo = accountTo.balance + transaction.amount;


    // deposit transction statememnt

    const statementTransactionFrom: IStatementTransaction = {
        id: transaction.id,
        date: formattedDate,
        transaction: "withdrawal",
        amount: transaction.amount,
        balance: mmaNewAccountBalanceFrom,
        rate: accountFrom.clientRate,
        remark: transaction.reference,
        createdAt: currentDate,
        fromAccountId: accountFrom.id,
        toAccountId: accountTo.id
    }

    await api.mma.createStatementTransaction(accountFrom.id, statementTransactionFrom);
    await onReAlign(accountFrom.id);


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
    }

    await api.mma.createStatementTransaction(accountTo.id, statementTransactionTo)
    await onReAlign(accountTo.id);
    // re align function
}
