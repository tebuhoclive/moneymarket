import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import CallDepositDeskDealingSheetModel, { ICallDepositDeskDealingSheet } from "../../../models/purchases/call-deposit/CallDepositDeskDealingSheetModel";

export default class CallDepositDeskDealingStore extends Store<ICallDepositDeskDealingSheet, CallDepositDeskDealingSheetModel> {
    items = new Map<string, CallDepositDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ICallDepositDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new CallDepositDeskDealingSheetModel(this.store, item))
            );
        });
    }
}