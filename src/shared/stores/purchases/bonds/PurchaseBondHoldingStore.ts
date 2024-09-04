import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import BondPurchaseHoldingModel, { IBondPurchaseHolding } from "../../../models/purchases/bonds/BondPurchaseHoldingModel";

export default class PurchaseBondHoldingStore extends Store<IBondPurchaseHolding, BondPurchaseHoldingModel> {
    items = new Map<string, BondPurchaseHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBondPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondPurchaseHoldingModel(this.store, item))
            );
        });
    }
}