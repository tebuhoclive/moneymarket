import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseExecution, { ITreasuryBillPurchaseExecution } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseExecutionModel";
import EquityPurchaseExecutionModel, { IEquityPurchaseExecution } from "../../../models/purchases/equity/EquityPurchaseExecutionModel";

export default class PurchaseEquityExecutionStore extends Store<IEquityPurchaseExecution, EquityPurchaseExecutionModel> {
    items = new Map<string, EquityPurchaseExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquityPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityPurchaseExecutionModel(this.store, item))
            );
        });
    }
}