import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseExecution, { ITreasuryBillPurchaseExecution } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseExecutionModel";
import UnitTrustPurchaseExecutionModel, { IUnitTrustPurchaseExecution } from "../../../models/purchases/unit-trust/UnitTrustPurchaseExecutionModel";

export default class PurchaseUnitTrustExecutionStore extends Store<IUnitTrustPurchaseExecution, UnitTrustPurchaseExecutionModel> {
    items = new Map<string, UnitTrustPurchaseExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrustPurchaseExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustPurchaseExecutionModel(this.store, item))
            );
        });
    }
}