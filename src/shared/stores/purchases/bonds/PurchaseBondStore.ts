import Store from "../../Store";
import AppStore from "../../AppStore";
import { runInAction } from "mobx";
import PurchaseBondModel, { IPurchaseBond } from "../../../models/purchases/bonds/BondPurchaseModel";

export default class PurchaseBondStore extends Store<IPurchaseBond, PurchaseBondModel> {
    items = new Map<string, PurchaseBondModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseBond[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseBondModel(this.store, item))
            );
        });
    }
}