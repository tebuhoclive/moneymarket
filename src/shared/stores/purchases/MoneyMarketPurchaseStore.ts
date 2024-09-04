import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import MoneyMarketAccountPurchase, { IMoneyMarketAccountPurchase } from "../../models/MoneyMarketAccountPurchase";


export default class MoneyMarketAccountPurchaseStore extends Store<IMoneyMarketAccountPurchase, MoneyMarketAccountPurchase> {
    items = new Map<string, MoneyMarketAccountPurchase>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IMoneyMarketAccountPurchase[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new MoneyMarketAccountPurchase(this.store, item))
            );
        });
    }
}