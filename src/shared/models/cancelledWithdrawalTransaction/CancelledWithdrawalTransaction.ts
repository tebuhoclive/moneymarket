import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultCancelledWithdrawalTransaction: ICancelledWithdrawalTransaction = {
    id: "",
    reference: "",
    amount: 0,
    transactionDate: Date.now(),
    entity: "",
    allocationStatus: "unallocated",
    transactionStatus: "Pending",
    bank: "",
    instruction: "",
    reasonForNoInstruction: "",
    isRecurring: false,
    valueDate: null,
    timeCreated: "",
    timeVerified: "",
    timeAuthorized: "",
    timeProcessPayment: "",
    executionTime: "",
    previousBalance: 0,
    batchStatus: false,
    stageCancelledFrom: "",
    cancellationComment: "",
    allocation: ""
}

export interface ICancelledWithdrawalTransaction {
    id: string;
    amount: number;
    reference: string;
    transactionDate: number | null;
    valueDate: number | null;
    allocation: string;
    entity: string,
    allocationStatus: string;
    transactionStatus: string;
    bank: string;
    instruction: string,
    reasonForNoInstruction: string,
    isRecurring: boolean,
    timeCreated: string;
    timeVerified: string;
    timeAuthorized: string;
    timeProcessPayment: string;
    executionTime: string;
    previousBalance: number;
    batchStatus: boolean;
    stageCancelledFrom: string;
    cancellationComment: string;
}


export default class CancelledWithdrawalTransactionModel {
    private cancelledWithdrawalTransaction: ICancelledWithdrawalTransaction;

    constructor(private store: AppStore, cancelledWithdrawalTransaction: ICancelledWithdrawalTransaction) {
        makeAutoObservable(this);
        this.cancelledWithdrawalTransaction = cancelledWithdrawalTransaction;
    }

    get uploader() {
        // return this.store.company.getById(this._companyDeduction.company);
        return null
    }

    get asJson(): ICancelledWithdrawalTransaction {
        return toJS(this.cancelledWithdrawalTransaction);
    }
}