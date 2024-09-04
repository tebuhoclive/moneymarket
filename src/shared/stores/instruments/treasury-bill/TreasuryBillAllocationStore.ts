import { runInAction } from "mobx";
import TreasuryBillAllocationModel, { ITreasuryBillAllocation } from "../../../models/instruments/treasury-bill/TreasuryBillAllocationModel";
import AppStore from "../../AppStore";
import Store from "../../Store";

export default class TreasuryBillAllocationStore extends Store<ITreasuryBillAllocation, TreasuryBillAllocationModel> {
    items = new Map<string, TreasuryBillAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillAllocationModel(this.store, item))
            );
        });
    }
}