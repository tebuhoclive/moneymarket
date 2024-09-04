import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import BondPurchaseTransactionModel, { IBondPurchaseTransaction } from "../../../models/purchases/bonds/BondPurchaseTransactionModel";

export default class PurchaseBondTransactionStore extends Store<IBondPurchaseTransaction, BondPurchaseTransactionModel> {
    items = new Map<string, BondPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBondPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondPurchaseTransactionModel(this.store, item))
            );
        });
    }
}