import { runInAction } from "mobx";
import TreasuryBillExecutionModel, { ITreasuryBillExecution } from "../../../models/instruments/treasury-bill/TreasuryBillExecutionModel";
import AppStore from "../../AppStore";
import Store from "../../Store";

export default class TreasuryBillExecutionStore extends Store<ITreasuryBillExecution, TreasuryBillExecutionModel> {
    items = new Map<string, TreasuryBillExecutionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillExecution[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillExecutionModel(this.store, item))
            );
        });
    }
}