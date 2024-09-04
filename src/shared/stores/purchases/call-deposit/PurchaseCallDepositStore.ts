import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import PurchaseCallDepositModel, { IPurchaseCallDeposit } from "../../../models/purchases/call-deposit/PurchaseCallDepositModel";

export default class PurchaseCallDepositStore extends Store<IPurchaseCallDeposit, PurchaseCallDepositModel> {
    items = new Map<string, PurchaseCallDepositModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IPurchaseCallDeposit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new PurchaseCallDepositModel(this.store, item))
            );
        });
    }
}