import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import SaleEquityModel, { ISaleEquity } from "../../models/sales/SaleEquityModel";

export default class SaleEquityStore extends Store<ISaleEquity, SaleEquityModel> {
    items = new Map<string, SaleEquityModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISaleEquity[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SaleEquityModel(this.store, item))
            );
        });
    }
}