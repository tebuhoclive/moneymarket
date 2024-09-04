import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import CancelledWithdrawalTransactionModel, { ICancelledWithdrawalTransaction } from "../../models/cancelledWithdrawalTransaction/CancelledWithdrawalTransaction";

export default class CancelledWithdrawalTransactionStore extends Store<ICancelledWithdrawalTransaction, CancelledWithdrawalTransactionModel> {
    items = new Map<string, CancelledWithdrawalTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICancelledWithdrawalTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CancelledWithdrawalTransactionModel(this.store, item))
            );
        });
    }
}