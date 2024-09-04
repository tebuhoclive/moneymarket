import { runInAction } from "mobx";
import FixedDepositModel, { IFixedDeposit } from "../../models/instruments/FixedDepositModel";
import Store from "../Store";
import AppStore from "../AppStore";
import CallDepositModel, { ICallDeposit } from "../../models/instruments/CallDepositModel";

export default class CallDepositStore extends Store<ICallDeposit, CallDepositModel> {
    items = new Map<string, CallDepositModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDeposit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositModel(this.store, item))
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