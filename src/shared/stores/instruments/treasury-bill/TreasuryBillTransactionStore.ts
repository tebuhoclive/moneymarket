import { runInAction } from "mobx";

import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillTransactionModel, { ITreasuryBillTransaction } from "../../../models/instruments/treasury-bill/TreasuryBillTransactionModel";

export default class TreasuryBillTransactionStore extends Store<ITreasuryBillTransaction, TreasuryBillTransactionModel> {
    items = new Map<string, TreasuryBillTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillTransactionModel(this.store, item))
            );
        });
    }
}