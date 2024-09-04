import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import BondPurchaseAllocationModel, { IBondPurchaseAllocation } from "../../../models/purchases/bonds/BondPurchaseAllocationModel";

export default class PurchaseBondsAllocationStore extends Store<IBondPurchaseAllocation, BondPurchaseAllocationModel> {
    items = new Map<string, BondPurchaseAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBondPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondPurchaseAllocationModel(this.store, item))
            );
        });
    }
}