import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import TreasuryBillPurchaseExecution, { ITreasuryBillPurchaseExecution } from "../../models/purchases/treasury-bills/TreasuryBillPurchaseExecutionModel";

export default class PurchaseTreasuryBillExecutionStore extends Store<ITreasuryBillPurchaseExecution, TreasuryBillPurchaseExecution> {
    items = new Map<string, TreasuryBillPurchaseExecution>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillPurchaseExecution(this.store, item))
            );
        });
    }
}