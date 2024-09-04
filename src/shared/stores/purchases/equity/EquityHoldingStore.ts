import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseHolding, { ITreasuryBillPurchaseHolding } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseHoldingModel";
import EquityPurchaseHoldingModel, { IEquityPurchaseHolding } from "../../../models/purchases/equity/EquityPurchaseHoldingModel";

export default class PurchaseEquityHoldingStore extends Store<IEquityPurchaseHolding, EquityPurchaseHoldingModel> {
    items = new Map<string, EquityPurchaseHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquityPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityPurchaseHoldingModel(this.store, item))
            );
        });
    }
}