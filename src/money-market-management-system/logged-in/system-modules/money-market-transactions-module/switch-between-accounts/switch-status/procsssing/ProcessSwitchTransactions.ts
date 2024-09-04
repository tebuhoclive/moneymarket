import AppApi from "../../../../../../../shared/apis/AppApi";
import { onReAlign } from "../../../../../../../shared/functions/transactions/CorrectionsOnStatement";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { IStatementTransaction, StatementTransactionTypes } from "../../../../../../../shared/models/StatementTransactionModel";
import { ISwitchTransaction } from "../../../../../../../shared/models/SwitchTransactionModel";
import AppStore from "../../../../../../../shared/stores/AppStore";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { processNormalSwitch } from "./ProcessNormalSwitch";
import { processSwitchCloseOuts } from "./ProcessSwitchCloseOuts";



export async function processSwitchTransactions(transaction: ISwitchTransaction, api: AppApi, store: AppStore) {
    if (!transaction) {
        console.error("No transaction provided.");
        return;
    }

    const accountFrom = store.mma.getItemById(transaction.fromAccount)?.asJson;
    const accountTo = store.mma.getItemById(transaction.toAccount)?.asJson;

    if (!accountFrom) {
        console.error(`From account with ID ${transaction.fromAccount} not found.`);
        return;
    }

    if (!accountTo) {
        console.error(`To account with ID ${transaction.toAccount} not found.`);
        return;
    }

    switch (transaction.transactionType) {
        case "Manual Switch Close Out":
            // Handle "Manual Switch Close Out" transaction
            await processSwitchCloseOuts(transaction, accountFrom, accountTo, api);
            break;
        case "Manual Switch":
            // Handle "Manual Switch" transaction
            await processNormalSwitch(transaction, accountFrom, accountTo, api);
            break;
        default:
            // Handle unexpected transaction types or throw an error
            console.warn(`Unhandled transaction type: ${transaction.transactionType}`);
            break;
    }
}


