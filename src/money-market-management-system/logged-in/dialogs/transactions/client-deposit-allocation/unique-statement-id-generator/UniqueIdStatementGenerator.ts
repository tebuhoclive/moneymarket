import { IDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import AppStore from "../../../../../../shared/stores/AppStore";

export function statementContraint(store: AppStore, transaction: IDepositTransaction) {
   
    const statementTrackers = store.statementTracker.all;

    



}