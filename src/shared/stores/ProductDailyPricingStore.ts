import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import ProductDailyPricingModel, { IProductDailyPricing } from "../models/ProductDailyPricingModel";


export default class ProductDailyPricingStore extends Store<IProductDailyPricing, ProductDailyPricingModel> {
    items = new Map<string, ProductDailyPricingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IProductDailyPricing[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new ProductDailyPricingModel(this.store, item))
            );
        });
    }
}