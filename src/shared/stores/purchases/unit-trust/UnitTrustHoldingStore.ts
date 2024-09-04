import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseHolding, { ITreasuryBillPurchaseHolding } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseHoldingModel";
import UnitTrustPurchaseHoldingModel, { IUnitTrustPurchaseHolding } from "../../../models/purchases/unit-trust/UnitTrustPurchaseHoldingModel";

export default class PurchaseUnitTrustHoldingStore extends Store<IUnitTrustPurchaseHolding, UnitTrustPurchaseHoldingModel> {
    items = new Map<string, UnitTrustPurchaseHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrustPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustPurchaseHoldingModel(this.store, item))
            );
        });
    }
}