import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import BondDeskDealingSheetModel, { IBondDeskDealingSheet } from "../../../models/purchases/bonds/BondDeskDealingSheetModel";

export default class BondDeskDealingStore extends Store<IBondDeskDealingSheet, BondDeskDealingSheetModel> {
    items = new Map<string, BondDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IBondDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BondDeskDealingSheetModel(this.store, item))
            );
        });
    }
}