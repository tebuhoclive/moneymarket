import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import WithdrawalTransactionAuditModel, { IWithdrawalTransactionAudit } from "../../models/withdrawal-transaction/WithdrawalTransactionAuditModel";


export default class WithdrawalTransactionAuditStore extends Store<IWithdrawalTransactionAudit, WithdrawalTransactionAuditModel> {
    items = new Map<string, WithdrawalTransactionAuditModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IWithdrawalTransactionAudit[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new WithdrawalTransactionAuditModel(this.store, item))
            );
        });
    }
}