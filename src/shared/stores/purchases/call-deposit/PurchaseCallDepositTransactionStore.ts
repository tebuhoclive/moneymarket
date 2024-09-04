import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import CallDepositPurchaseTransactionModel, { ICallDepositPurchaseTransaction } from "../../../models/purchases/call-deposit/CallDepositPurchaseTransactionModel";

export default class PurchaseCallDepositTransactionStore extends Store<ICallDepositPurchaseTransaction, CallDepositPurchaseTransactionModel> {
    items = new Map<string, CallDepositPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDepositPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositPurchaseTransactionModel(this.store, item))
            );
        });
    }
}