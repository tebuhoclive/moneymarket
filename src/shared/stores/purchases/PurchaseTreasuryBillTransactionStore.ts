import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import TreasuryBillPurchaseTransactionModel, { ITreasuryBillPurchaseTransaction } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseTransactionModel";

export default class PurchaseTreasuryBillTransactionStore extends Store<ITreasuryBillPurchaseTransaction, TreasuryBillPurchaseTransactionModel> {
    items = new Map<string, TreasuryBillPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillPurchaseTransactionModel(this.store, item))
            );
        });
    }
}