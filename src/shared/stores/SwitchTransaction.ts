import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import SwitchTransactionModel, { ISwitchTransaction } from "../models/SwitchTransactionModel";

export default class SwitchTransactionStore extends Store<ISwitchTransaction, SwitchTransactionModel> {
    items = new Map<string, SwitchTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISwitchTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SwitchTransactionModel(this.store, item))
            );
        });
    }
}