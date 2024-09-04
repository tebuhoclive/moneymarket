import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import ProductDailyInflowModel, { IProductDailyInflow } from "../models/ProductiDailyInflowModel";

export default class ProductDailyInflowStore extends Store<IProductDailyInflow, ProductDailyInflowModel> {
    items = new Map<string, ProductDailyInflowModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IProductDailyInflow[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new ProductDailyInflowModel(this.store, item))
            );
        });
    }
}