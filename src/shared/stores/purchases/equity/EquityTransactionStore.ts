import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import EquityPurchaseTransactionModel, { IEquityPurchaseTransaction } from "../../../models/purchases/equity/EquityPurchaseTransactionModel";

export default class PurchaseEquityTransactionStore extends Store<IEquityPurchaseTransaction, EquityPurchaseTransactionModel> {
    items = new Map<string, EquityPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquityPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityPurchaseTransactionModel(this.store, item))
            );
        });
    }
}