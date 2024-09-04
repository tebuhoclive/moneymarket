import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillDeskDealingSheetModel, { ITreasuryBillDeskDealingSheet } from "../../../models/purchases/treasury-bills/TreasuryBillDeskDealingSheetModel";
import UnitTrustDeskDealingSheetModel, { IUnitTrustDeskDealingSheet } from "../../../models/purchases/unit-trust/UnitTrustDeskDealingSheetModel";

export default class UnitTrustDeskDealingStore extends Store<IUnitTrustDeskDealingSheet, UnitTrustDeskDealingSheetModel > {
    items = new Map<string, UnitTrustDeskDealingSheetModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IUnitTrustDeskDealingSheet[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new UnitTrustDeskDealingSheetModel(this.store, item))
            );
        });
    }
}