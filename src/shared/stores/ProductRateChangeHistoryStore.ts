import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import ProductRateChangeHistoryModel, { IProductRateChangeHistory } from "../models/ProductRateChangeHistoryModel";


export default class ProductRateChangeHistoryStore extends Store<IProductRateChangeHistory, ProductRateChangeHistoryModel> {
    items = new Map<string, ProductRateChangeHistoryModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IProductRateChangeHistory[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new ProductRateChangeHistoryModel(this.store, item))
            );
        });
    }
}