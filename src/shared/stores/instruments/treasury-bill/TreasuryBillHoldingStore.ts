import { runInAction } from "mobx";
import TreasuryBillHoldingModel, { ITreasuryBillHolding } from "../../../models/instruments/treasury-bill/TreasuryBillHoldingModel";
import AppStore from "../../AppStore";
import Store from "../../Store";


export default class TreasuryBillHoldingStore extends Store<ITreasuryBillHolding, TreasuryBillHoldingModel> {
    items = new Map<string, TreasuryBillHoldingModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: ITreasuryBillHolding[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new TreasuryBillHoldingModel(this.store, item))
            );
        });
    }
}