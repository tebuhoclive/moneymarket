import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseAllocation, { ITreasuryBillPurchaseAllocation } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import UnitTrustPurchaseAllocationModel, { IUnitTrustPurchaseAllocation } from "../../../models/purchases/unit-trust/UnitTrustPurchaseAllocationModel";

export default class PurchaseUnitTrustAllocationStore extends Store<IUnitTrustPurchaseAllocation, UnitTrustPurchaseAllocationModel> {
    items = new Map<string, UnitTrustPurchaseAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrustPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustPurchaseAllocationModel(this.store, item))
            );
        });
    }
}