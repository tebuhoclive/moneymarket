import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import SaleFixedDepositModel, { ISaleFixedDeposit } from "../../models/sales/SaleFixedDepositModel";

export default class SaleFixedDepositStore extends Store<ISaleFixedDeposit, SaleFixedDepositModel> {
    items = new Map<string, SaleFixedDepositModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ISaleFixedDeposit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new SaleFixedDepositModel(this.store, item))
            );
        });
    }
}