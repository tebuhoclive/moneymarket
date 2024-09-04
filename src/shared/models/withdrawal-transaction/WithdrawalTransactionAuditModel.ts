import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IWithdrawalTransaction } from "./WithdrawalTransactionModel";


export interface IWithdrawalTransactionAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit: IWithdrawalTransaction;
    dataStateAfterAudit: IWithdrawalTransaction;
    actionUser: string;
}

export default class WithdrawalTransactionAuditModel {
    private withdrawalTransactionAudit: IWithdrawalTransactionAudit;

    constructor(private store: AppStore, withdrawalTransactionAudit: IWithdrawalTransactionAudit) {
        makeAutoObservable(this);
        this.withdrawalTransactionAudit = withdrawalTransactionAudit;
    }

    get asJson(): IWithdrawalTransactionAudit {
        return toJS(this.withdrawalTransactionAudit);
    }
}