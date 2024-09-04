import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import TreasuryBillPurchaseAllocation, { ITreasuryBillPurchaseAllocation } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";

export default class PurchaseTreasuryBillAllocationStore extends Store<ITreasuryBillPurchaseAllocation, TreasuryBillPurchaseAllocation> {
    items = new Map<string, TreasuryBillPurchaseAllocation>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillPurchaseAllocation(this.store, item))
            );
        });
    }
}