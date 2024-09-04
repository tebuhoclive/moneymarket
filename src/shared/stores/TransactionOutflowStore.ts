import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import TransactionOutflowModel, { ITransactionOutflow } from "../models/TransactionOutflowModel";

export default class TransactionOutflowStore extends Store<ITransactionOutflow, TransactionOutflowModel> {
    items = new Map<string, TransactionOutflowModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITransactionOutflow[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TransactionOutflowModel(this.store, item))
            );
        });
    }
}