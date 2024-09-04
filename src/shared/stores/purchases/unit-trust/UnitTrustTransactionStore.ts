import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import UnitTrustPurchaseTransactionModel, { IUnitTrustPurchaseTransaction } from "../../../models/purchases/unit-trust/UnitTrustPurchaseTransactionModel";

export default class PurchaseUnitTrustTransactionStore extends Store<IUnitTrustPurchaseTransaction, UnitTrustPurchaseTransactionModel> {
    items = new Map<string, UnitTrustPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrustPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustPurchaseTransactionModel(this.store, item))
            );
        });
    }
}