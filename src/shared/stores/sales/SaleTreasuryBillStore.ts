import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import SaleTreasuryBillModel, { ISaleTreasuryBill } from "../../models/sales/SaleTreasuryBillModel";

export default class SaleTreasuryBillStore extends Store<ISaleTreasuryBill, SaleTreasuryBillModel> {
    items = new Map<string, SaleTreasuryBillModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISaleTreasuryBill[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SaleTreasuryBillModel(this.store, item))
            );
        });
    }
}