import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import BondPurchaseExecutionModel, { IBondPurchaseExecution } from "../../../models/purchases/bonds/BondPurchaseExecutionModel";

export default class PurchaseBondExecutionStore extends Store<IBondPurchaseExecution, BondPurchaseExecutionModel> {
    items = new Map<string, BondPurchaseExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBondPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondPurchaseExecutionModel(this.store, item))
            );
        });
    }
}