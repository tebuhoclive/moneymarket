import { runInAction } from "mobx";
import FixedDepositModel, { IFixedDeposit } from "../../models/instruments/FixedDepositModel";
import Store from "../Store";
import AppStore from "../AppStore";

export default class FixedDepositStore extends Store<IFixedDeposit, FixedDepositModel> {
    items = new Map<string, FixedDepositModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDeposit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositModel(this.store, item))
            );
        });
    }

    get approvedDeposits() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "approved");
    }
    get pendingDeposits() {
        const list = Array.from(this.items.values());
        return list.filter((item) => item.asJson.instrumentStatus === "pending");
    }
}