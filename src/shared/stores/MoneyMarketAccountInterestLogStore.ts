import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import MoneyMarketAccountInterestLogModel, { IMoneyMarketAccountInterestLog } from "../models/MoneyMarketAccountInterestLog";

export default class MoneyMarketAccountInterestLogStore extends Store<IMoneyMarketAccountInterestLog, MoneyMarketAccountInterestLogModel> {
    items = new Map<string, MoneyMarketAccountInterestLogModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IMoneyMarketAccountInterestLog[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new MoneyMarketAccountInterestLogModel(this.store, item))
            );
        });
    }
}