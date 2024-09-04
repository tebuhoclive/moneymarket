import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseAllocation, { ITreasuryBillPurchaseAllocation } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import CallDepositPurchaseAllocationModel, { ICallDepositPurchaseAllocation } from "../../../models/purchases/call-deposit/CallDepositPurchaseAllocationModel";

export default class CallDepositAllocationStore extends Store<ICallDepositPurchaseAllocation, CallDepositPurchaseAllocationModel> {
    items = new Map<string, CallDepositPurchaseAllocationModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDepositPurchaseAllocation[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositPurchaseAllocationModel(this.store, item))
            );
        });
    }
}