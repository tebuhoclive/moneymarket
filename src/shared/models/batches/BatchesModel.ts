import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { IWithdrawalTransaction } from "../withdrawal-transaction/WithdrawalTransactionModel";


export const defaultPaymentBatchFile: IWithdrawalPaymentBatch = {
    id: "",
    batchNumber: "",
    paymentBatchFileTransactions: [],
    processedBy: "",
    batchedBy: "",
    batchedDateTime: 0,
    paymentBatchFileType: "",
    isFileDownloaded: false,
    batchFileStatus: "",
    lastModifiedBy: "",
    lastModifiedDateTime: 0,
    batchFileValue: 0,
    batchPaymentFileReport: []
}

export interface IWithdrawalPaymentBatch {
    id: string;
    batchNumber: string;
    paymentBatchFileTransactions: IWithdrawalTransaction[];
    processedBy?: string;
    batchedBy: string,
    batchedDateTime: number;
    paymentBatchFileType:string; // ZAR | Normal | High Value 
    isFileDownloaded: boolean;
    batchFileStatus: string; // Completed | Failed | Pending | Archived
    lastModifiedBy: string;
    lastModifiedDateTime:number;
    batchFileValue:number;
    batchPaymentFileReport:IBatchPaymentFileReport[]
}
interface IBatchPaymentFileReport{
    transactionId: string;
    batchStatus: string; //Processed | Returned | Cancelled | Failed
    remark: string;
    actionDate: number;
    isClientNotified: string;
}


export default class BatchesModel {
    private batches: IWithdrawalPaymentBatch;

    constructor(private store: AppStore, batches: IWithdrawalPaymentBatch) {
        makeAutoObservable(this);
        this.batches = batches;
    }

    get asJson(): IWithdrawalPaymentBatch {
        return toJS(this.batches);
    }
}

