import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseHolding, { ITreasuryBillPurchaseHolding } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseHoldingModel";
import CallDepositPurchaseHoldingModel, { ICallDepositPurchaseHolding } from "../../../models/purchases/call-deposit/CallDepositPurchaseHoldingModel";

export default class PurchaseCallDepositHoldingStore extends Store<ICallDepositPurchaseHolding, CallDepositPurchaseHoldingModel> {
    items = new Map<string, CallDepositPurchaseHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDepositPurchaseHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositPurchaseHoldingModel(this.store, item))
            );
        });
    }
}