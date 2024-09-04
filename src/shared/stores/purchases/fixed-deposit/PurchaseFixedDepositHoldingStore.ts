import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import FixedDepositPurchaseHoldingModel, { IFixedDepositPurchaseHolding } from "../../../models/purchases/fixed-deposit/FixedDepositPurchaseHoldingModel";

export default class PurchaseFixedDepositHoldingStore extends Store<IFixedDepositPurchaseHolding,   FixedDepositPurchaseHoldingModel> {
    items = new Map<string, FixedDepositPurchaseHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDepositPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositPurchaseHoldingModel(this.store, item))
            );
        });
    }
}