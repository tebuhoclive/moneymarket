import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import TransactionInflowModel, { ITransactionInflow } from "../models/TransactionInflowModel";

export default class TransactionInflowStore extends Store<ITransactionInflow, TransactionInflowModel> {
    items = new Map<string, TransactionInflowModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITransactionInflow[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TransactionInflowModel(this.store, item))
            );
        });
    }
}