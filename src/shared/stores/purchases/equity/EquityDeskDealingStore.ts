import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import EquityDeskDealingSheetModel, { IEquityDeskDealingSheet } from "../../../models/purchases/equity/EquityDeskDealingSheetModel";

export default class EquityDeskDealingStore extends Store<IEquityDeskDealingSheet, EquityDeskDealingSheetModel> {
    items = new Map<string, EquityDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IEquityDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new EquityDeskDealingSheetModel(this.store, item))
            );
        });
    }
}