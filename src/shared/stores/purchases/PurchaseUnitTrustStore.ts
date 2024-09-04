import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import PurchaseUnitTrustModel, { IPurchaseUnitTrust } from "../../models/purchases/PurchaseUnitTrustModel";

export default class PurchaseUnitTrustStore extends Store<IPurchaseUnitTrust, PurchaseUnitTrustModel> {
    items = new Map<string, PurchaseUnitTrustModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseUnitTrust[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseUnitTrustModel(this.store, item))
            );
        });
    }
}