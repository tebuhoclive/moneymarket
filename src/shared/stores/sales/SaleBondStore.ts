import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import SaleBondModel, { ISaleBond } from "../../models/sales/SaleBondModel";

export default class SaleBondStore extends Store<ISaleBond, SaleBondModel> {
    items = new Map<string, SaleBondModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISaleBond[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SaleBondModel(this.store, item))
            );
        });
    }
}