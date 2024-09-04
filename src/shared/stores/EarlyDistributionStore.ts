import { runInAction } from "mobx";
import EarlyDistributionAccountModel, { IEarlyDistributionAccount } from "../models/EarlyDistributionAccountModel";
import Store from "./Store";
import AppStore from "./AppStore";

export default class EarlyDistributionStore extends Store<IEarlyDistributionAccount, EarlyDistributionAccountModel> {
    items = new Map<string, EarlyDistributionAccountModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEarlyDistributionAccount[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EarlyDistributionAccountModel(this.store, item))
            );
        });
    }
}