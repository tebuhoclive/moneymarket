import { runInAction } from "mobx";
import AppStore from "../../AppStore";
import Store from "../../Store";
import TreasuryBillPurchaseTransactionModel, { ITreasuryBillPurchaseTransaction } from "../../../models/purchases/treasury-bills/TreasuryBillPurchaseTransactionModel";
import FixedDepositPurchaseTransactionModel, { IFixedDepositPurchaseTransaction } from "../../../models/purchases/fixed-deposit/FixedDepositPurchaseTransactionModel";

export default class PurchaseFixedDepositTransactionStore extends Store<IFixedDepositPurchaseTransaction, FixedDepositPurchaseTransactionModel> {
    items = new Map<string, FixedDepositPurchaseTransactionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IFixedDepositPurchaseTransaction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new FixedDepositPurchaseTransactionModel(this.store, item))
            );
        });
    }
}