import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import WithdrawalTransactionModel, { IWithdrawalTransaction } from "../../models/withdrawal-transaction/WithdrawalTransactionModel";

export default class WithdrawalTransactionStore extends Store<IWithdrawalTransaction, WithdrawalTransactionModel> {
    items = new Map<string, WithdrawalTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IWithdrawalTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new WithdrawalTransactionModel(this.store, item))
            );
        });
    }
    getWithdrawalChildTransactions(parentId: string): IWithdrawalTransaction[] {
        const transactions = this.store.withdrawalTransaction.all
            .filter((transaction) => transaction.asJson.parentTransaction === parentId)
            .map((transaction) => transaction.asJson);
        return transactions;
    }
}