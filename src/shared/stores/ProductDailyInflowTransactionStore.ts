import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import ProductDailyInflowTransactionModel, { IProductDailyInflowTransaction } from "../models/ProductiDailyInflowTransactionModel";

export default class ProductDailyInflowTransactionStore extends Store<IProductDailyInflowTransaction, ProductDailyInflowTransactionModel> {
    items = new Map<string, ProductDailyInflowTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IProductDailyInflowTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new ProductDailyInflowTransactionModel(this.store, item))
            );
        });
    }
}