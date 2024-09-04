import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import AccountRateChangeHistoryModel, { IAccountRateChangeHistory } from "../models/AccountRateChangeHistoryModel";


export default class AccountRateChangeHistoryStore extends Store<IAccountRateChangeHistory, AccountRateChangeHistoryModel> {
    items = new Map<string, AccountRateChangeHistoryModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IAccountRateChangeHistory[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new AccountRateChangeHistoryModel(this.store, item))
            );
        });
    }
}