import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseAllocation, { ITreasuryBillPurchaseAllocation } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import EquityPurchaseAllocationModel, { IEquityPurchaseAllocation } from "../../../models/purchases/equity/EquityAllocationModel";

export default class PurchaseEquityAllocationStore extends Store<IEquityPurchaseAllocation, EquityPurchaseAllocationModel> {
    items = new Map<string, EquityPurchaseAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquityPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityPurchaseAllocationModel(this.store, item))
            );
        });
    }
}