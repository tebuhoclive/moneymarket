import { runInAction } from "mobx";
import Store from "../../Store";
import AppStore from "../../AppStore";
import PurchaseFixedDepositModel, { IPurchaseFixedDeposit } from "../../../models/purchases/fixed-deposit/PurchaseFixedDepositModel";

export default class PurchaseFixedDepositStore extends Store<IPurchaseFixedDeposit, PurchaseFixedDepositModel> {
    items = new Map<string, PurchaseFixedDepositModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseFixedDeposit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseFixedDepositModel(this.store, item))
            );
        });
    }
}