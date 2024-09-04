import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IRecurringWithdrawalInstruction } from "./RecurringWithdrawalInstructionModel";

export const defaultRecurringWithdrawalInstructionAudit: IRecurringWithdrawalInstructionAudit = {
    id: "",
    auditDateTime: 0,
    action: "",
    actionDescription: "",
    dataStateBeforeAudit: {
        id: "",
        amount: 0,
        reference: "",
        description: "",
        transactionDate: null,
        valueDate: null,
        entity: "",
        allocation: "",
        allocationStatus: "Pending",
        transactionStatus: "Pending",
        bank: "",
        instruction: "",
        reasonForNoInstruction: "",
        recurringDay: null
    },
    dataStateAfterAudit: {
        id: "",
        amount: 0,
        reference: "",
        description: "",
        transactionDate: null,
        valueDate: null,
        entity: "",
        allocation: "",
        allocationStatus: "Pending",
        transactionStatus: "Pending",
        bank: "",
        instruction: "",
        reasonForNoInstruction: "",
        recurringDay: null
    },
    actionUser: ""
}

export interface IRecurringWithdrawalInstructionAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit:IRecurringWithdrawalInstruction;
    dataStateAfterAudit:IRecurringWithdrawalInstruction;
    actionUser: string;
}

export default class RecurringWithdrawalInstructionAuditModel {
    private RecurringWithdrawalInstructionAudit: IRecurringWithdrawalInstructionAudit;

    constructor(private store: AppStore, RecurringWithdrawalInstructionAudit: IRecurringWithdrawalInstructionAudit) {
        makeAutoObservable(this);
        this.RecurringWithdrawalInstructionAudit = RecurringWithdrawalInstructionAudit;
    }

    get asJson(): IRecurringWithdrawalInstructionAudit {
        return toJS(this.RecurringWithdrawalInstructionAudit);
    }
}