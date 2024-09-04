import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import FixedDepositPurchaseExecutionModel, { IFixedDepositPurchaseExecution } from "../../../models/purchases/fixed-deposit/FixedDepositPurchaseExecutionModel";

export default class PurchaseFixedDepositExecutionStore extends Store<IFixedDepositPurchaseExecution, FixedDepositPurchaseExecutionModel> {
    items = new Map<string, FixedDepositPurchaseExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDepositPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositPurchaseExecutionModel(this.store, item))
            );
        });
    }
}