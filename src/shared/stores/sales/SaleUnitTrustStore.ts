import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import SaleUnitTrustModel, { ISaleUnitTrust } from "../../models/sales/SaleUnitTrustModel";

export default class SaleUnitTrustStore extends Store<ISaleUnitTrust, SaleUnitTrustModel> {
    items = new Map<string, SaleUnitTrustModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISaleUnitTrust[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SaleUnitTrustModel(this.store, item))
            );
        });
    }
}