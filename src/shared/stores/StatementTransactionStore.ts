import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import StatementTransactionModel, { IStatementTransaction } from "../models/StatementTransactionModel";

export default class StatementTransactionStore extends Store<IStatementTransaction, StatementTransactionModel> {
    items = new Map<string, StatementTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IStatementTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new StatementTransactionModel(this.store, item))
            );
        });
    }

    addItem(item: IStatementTransaction) {
        runInAction(() => {
            this.items.set(item.id, new StatementTransactionModel(this.store, item));
        });
    }

    removeItem(itemId: string) {
        runInAction(() => {
            this.items.delete(itemId);
        });
    } 
}