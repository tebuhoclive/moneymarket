import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import DepositTransactionAuditModel, { IDepositTransactionAudit } from "../../models/deposit-transaction/DepositTransactionAuditModel";

export default class depositTransactionAuditStore extends Store<IDepositTransactionAudit, DepositTransactionAuditModel> {
    items = new Map<string, DepositTransactionAuditModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDepositTransactionAudit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DepositTransactionAuditModel(this.store, item))
            );
        });
    }
}