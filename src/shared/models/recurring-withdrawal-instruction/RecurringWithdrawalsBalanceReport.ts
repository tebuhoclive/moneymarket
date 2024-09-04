import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultRecurringWithdrawalBalanceReport: IRecurringWithdrawalsBalanceReport = {
    id: "",
    date: "", // Make sure date property is a string
    clientId: "",
    clientName: "",
    clientBalance: 0,
    recurringAmount: 0,
}

export interface IRecurringWithdrawalsBalanceReport {
    id: string;
    date: string; // Ensure date property is a string
    clientId: string;
    clientName: string;
    clientBalance: number;
    recurringAmount: number;
    allocation?:string;
}

export default class RecurringWithdrawalBalanceReportModel {
    private RecurringWithdrawalBalanceReportModel: IRecurringWithdrawalsBalanceReport;

    constructor(private store: AppStore, RecurringWithdrawalBalanceReportModel: IRecurringWithdrawalsBalanceReport) {
        makeAutoObservable(this);
        this.RecurringWithdrawalBalanceReportModel = RecurringWithdrawalBalanceReportModel;
    }

    get uploader() {
        // return this.store.company.getById(this._companyDeduction.company);
        return null
    }

    get asJson(): IRecurringWithdrawalsBalanceReport {
        return toJS(this.RecurringWithdrawalBalanceReportModel);
    }
}
