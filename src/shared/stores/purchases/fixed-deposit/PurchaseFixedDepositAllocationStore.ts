import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import FixedDepositPurchaseAllocationModel, { IFixedDepositPurchaseAllocation } from "../../../models/purchases/fixed-deposit/FixedDepositPurchaseAllocationModel";

export default class PurchaseFixedDepositAllocationStore extends Store<IFixedDepositPurchaseAllocation, FixedDepositPurchaseAllocationModel> {
    items = new Map<string, FixedDepositPurchaseAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDepositPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositPurchaseAllocationModel(this.store, item))
            );
        });
    }
}