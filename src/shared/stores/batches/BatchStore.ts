import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import BatchesModel, { IWithdrawalPaymentBatch } from "../../models/batches/BatchesModel";

export default class BatchStore extends Store<IWithdrawalPaymentBatch, BatchesModel> {
    items = new Map<string, BatchesModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IWithdrawalPaymentBatch[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new BatchesModel(this.store, item))
            );
        });
    }
}