import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IDepositTransaction } from "./DepositTransactionModel";

export interface IDepositTransactionAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit:IDepositTransaction;
    dataStateAfterAudit:IDepositTransaction;
    actionUser: string;
}

export default class DepositTransactionAuditModel {
    private depositTransactionAudit: IDepositTransactionAudit;

    constructor(private store: AppStore, depositTransactionAudit: IDepositTransactionAudit) {
        makeAutoObservable(this);
        this.depositTransactionAudit = depositTransactionAudit;
    }

    get asJson(): IDepositTransactionAudit {
        return toJS(this.depositTransactionAudit);
    }
}