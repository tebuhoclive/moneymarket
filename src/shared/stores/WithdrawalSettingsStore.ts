import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import TransactionSettingsModel, { IWithdrawalSetting } from "../models/WithdrawalSettings";


export default class TransactionSettingsStore extends Store<IWithdrawalSetting, TransactionSettingsModel> {
    items = new Map<string, TransactionSettingsModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IWithdrawalSetting[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TransactionSettingsModel(this.store, item))
            );
        });
    }
}