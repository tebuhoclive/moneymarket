import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import DailyStatementModel, { IDailyStatement } from "../models/Statement";

export default class DailyStatementStore extends Store<IDailyStatement, DailyStatementModel> {
    items = new Map<string, DailyStatementModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDailyStatement[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DailyStatementModel(this.store, item))
            );
        });
    }
}