import { runInAction } from "mobx";
import TreasuryBillDeskDealingSheetModel, { ITreasuryBillDeskDealingSheet } from "../../../models/purchases/treasury-bills/TreasuryBillDeskDealingSheetModel";
import AppStore from "../../AppStore";
import Store from "../../Store";

export default class TreasuryBillDeskDealingStore extends Store<ITreasuryBillDeskDealingSheet, TreasuryBillDeskDealingSheetModel> {
    items = new Map<string, TreasuryBillDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillDeskDealingSheetModel(this.store, item))
            );
        });
    }
}