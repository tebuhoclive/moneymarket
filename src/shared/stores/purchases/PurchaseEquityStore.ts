import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import PurchaseEquityModel, { IPurchaseEquity } from "../../models/purchases/PurchaseEquityModel";

export default class PurchaseEquityStore extends Store<IPurchaseEquity, PurchaseEquityModel> {
    items = new Map<string, PurchaseEquityModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseEquity[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseEquityModel(this.store, item))
            );
        });
    }
}