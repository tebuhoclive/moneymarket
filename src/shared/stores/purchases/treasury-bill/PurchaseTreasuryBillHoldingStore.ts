import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseHolding, { ITreasuryBillPurchaseHolding } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseHoldingModel";

export default class PurchaseTreasuryBillHoldingStore extends Store<ITreasuryBillPurchaseHolding, TreasuryBillPurchaseHolding> {
    items = new Map<string, TreasuryBillPurchaseHolding>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillPurchaseHolding(this.store, item))
            );
        });
    }
}