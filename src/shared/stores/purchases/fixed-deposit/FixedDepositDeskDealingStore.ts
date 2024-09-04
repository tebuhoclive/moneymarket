import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillDeskDealingSheetModel, { ITreasuryBillDeskDealingSheet } from "../../../models/purchases/treasury-bills/TreasuryBillDeskDealingSheetModel";
import FixedDepositDeskDealingSheetModel, { IFixedDepositDeskDealingSheet } from "../../../models/purchases/fixed-deposit/FixedDepositDeskDealingSheetModel";

export default class FixedDepositDeskDealingStore extends Store<IFixedDepositDeskDealingSheet, FixedDepositDeskDealingSheetModel> {
    items = new Map<string, FixedDepositDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDepositDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositDeskDealingSheetModel(this.store, item))
            );
        });
    }
}