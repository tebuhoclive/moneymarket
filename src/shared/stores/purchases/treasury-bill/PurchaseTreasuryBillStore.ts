import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import PurchaseTreasuryBillModel, { IPurchaseTreasuryBill } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseModel";

export default class PurchaseTreasuryBillStore extends Store<IPurchaseTreasuryBill, PurchaseTreasuryBillModel> {
    items = new Map<string, PurchaseTreasuryBillModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseTreasuryBill[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseTreasuryBillModel(this.store, item))
            );
        });
    }
}