import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import DepositTransactionModel, { IDepositTransaction } from "../../models/deposit-transaction/DepositTransactionModel";
import { transactions } from "../../../money-market-management-system/logged-out/TestDating";

export default class DepositTransactionStore extends Store<IDepositTransaction, DepositTransactionModel> {
    items = new Map<string, DepositTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDepositTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DepositTransactionModel(this.store, item))
            );
        });
    }
    getChildTransactions(parentId: string): IDepositTransaction[] {
        const transactions = this.store.depositTransaction.all
            .filter((transaction) => transaction.asJson.parentTransaction === parentId)
            .map((transaction) => transaction.asJson);
        return transactions;
    }
}