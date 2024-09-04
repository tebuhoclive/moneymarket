import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import RecurringWithdrawalBalanceReportModel, { IRecurringWithdrawalsBalanceReport } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalsBalanceReport";


export default class RecurringWithdrawalBalanceReportStore extends Store<IRecurringWithdrawalsBalanceReport, RecurringWithdrawalBalanceReportModel> {
    items = new Map<string, RecurringWithdrawalBalanceReportModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IRecurringWithdrawalsBalanceReport[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new RecurringWithdrawalBalanceReportModel(this.store, item))
            );
        });
    }
}