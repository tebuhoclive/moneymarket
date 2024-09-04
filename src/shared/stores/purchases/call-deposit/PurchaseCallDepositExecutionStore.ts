import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseExecution, { ITreasuryBillPurchaseExecution } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseExecutionModel";
import CallDepositPurchaseExecutionModel, { ICallDepositPurchaseExecution } from "../../../models/purchases/call-deposit/CallDepositPurchaseExecutionModel";

export default class CallDepositExecutionStore extends Store<ICallDepositPurchaseExecution, CallDepositPurchaseExecutionModel> {
    items = new Map<string, CallDepositPurchaseExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDepositPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositPurchaseExecutionModel(this.store, item))
            );
        });
    }
}