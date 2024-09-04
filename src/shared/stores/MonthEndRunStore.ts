import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import MonthEndRunModel, { IMonthEndRun } from "../models/MonthEndRunModel";

export default class MonthEndRunStore extends Store<IMonthEndRun, MonthEndRunModel> {
    items = new Map<string, MonthEndRunModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IMonthEndRun[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new MonthEndRunModel(this.store, item))
            );
        });
    }

    addItem(item: IMonthEndRun) {
        runInAction(() => {
            this.items.set(item.id, new MonthEndRunModel(this.store, item));
        });
    }

    removeItem(itemId: string) {
        runInAction(() => {
            this.items.delete(itemId);
        });
    } 
}