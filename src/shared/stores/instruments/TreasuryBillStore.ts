import { runInAction } from "mobx";
import TreasuryBillModel, { ITreasuryBill } from "../../models/instruments/TreasuryBillModel";
import AppStore from "../AppStore";
import Store from "../Store";


export default class TreasuryBillStore extends Store<ITreasuryBill, TreasuryBillModel> {
    items = new Map<string, TreasuryBillModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBill[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillModel(this.store, item))
            );
        });
    }

    get approvedTreasyBills() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "approved");
    }
    get pendingTreasyBills() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "pending");
    }
}