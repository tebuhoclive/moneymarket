import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultWithdrawalTransaction: IWithdrawalTransaction = {
    id: "",
    transactionDate: 0,
    valueDate: 0,
    amount: 0,
    balanceOfPaymentCodes: "",
    accountNumber: "",
    productCode: "",
    entityNumber: "",
    clientBankingDetails: "",
    bankReference: "",
    clientInstruction: {
        url: "",
        reasonForNotAttaching: ""
    },
    sourceOfFundsAttachment: {
        url: "",
        reasonForNotAttaching: ""
    },
    bankingDetails: [],
    sourceOfFunds: "",
    withdrawalNodeType: "Parent",
    transactionIdentifier: "",
    createdAtTime: {
        transactionQueue: Date.now()
    },
    transactionType: "",
    allocationStatus: "",
    transactionStatus: "",
    withdrawalTransactionProcess: "",
    description: "",
    emailAddress: ""
}

export interface IWithdrawalTransaction {
    id: string;
    transactionDate: number; //the date the transaction was created in the system. System Generated (when statement is uploaded and when transaction is recorded)
    valueDate: number; //the date on which the transaction should actioned on
    amount: number; //the transaction amount
    accountNumber: string; //the money market account number
    productCode: string;
    entityNumber: string; // the entityNumber of the client who owns the accountNumber
    clientBankingDetails: string; // the Bank Account ID in which the transaction was created, the banks are stored in the system
    bankReference: string; //the statement that should appear as the money market account statement transaction remark
    //files
    clientInstruction: {
        url?: string;
        reasonForNotAttaching: string;
    };
    sourceOfFundsAttachment: {
        url?: string, // if a source of fund description is provided ensure that an attachment is required
        reasonForNotAttaching: string
    }
    sourceOfFunds: string; // this is the source of funds description

    parentTransaction?: string; //every transaction that is part of a split withdrawal should be assigned the ID of the main transaction
    withdrawalNodeType: withdrawalNodeType; //determines whether the transaction is a Parent or a Child
    transactionIdentifier: string; //is used to uniquely identify a transaction
    createdAtTime: IWithdrawalTransactionCreatedAtTimes; //used to store/update timestamps for each queue that the transaction moves to
    transactionAction?: WithdrawalTransactionActions;
    transactionType: WithdrawalTransactionType; //this is defined by the method used to capture the transaction
    allocationStatus: WithdrawalAllocationStatus; //this is status of the transaction that will define what functions can be executed on the transaction
    transactionStatus: WithdrawalTransactionStatus; //this is status of the transaction that will indicate what queue it is currently on
    withdrawalTransactionProcess: WithdrawalTransactionProcess; //this determines how the transaction should be processed for completion
    description: string;
    note?: string;
    reasonForDeleting?: string;
    emailAddress?: string;
    capturedBy?: string;
    firstLevelApprover?: string;
    secondLevelApprover?: string;
    accountName?: string;
    useAgent?: boolean;
    agentBankingDetails?: string;
    closeOutInterest?: number,
    closeOutDays?: number,
    bankingDetails?: Array<{ label: string; value: string }>;
    streetName?: string; // 35 char
    townName?: string; // 35 char
    province?: string; // 35 char
    postalCode?: string; // 10 char
    countryCode?: string; // 2 char
    balanceOfPaymentCodes?: string; // 35 char
    balanceOfPaymentCodeEntityType?: string; // 35 char
    processedBy?: string;
    batchedBy?: string;
}


export interface IWithdrawalTransactionQueueData {
    index: string,
    id: string;
    emailAddress?: string;
    bankValueDate?: number;
    valueDateView: string,
    valueDate: number,
    transactionDateView: string;
    transactionDate: number;
    reasonForDeleting?: string;
    amount: number;
    accountNumber: string;
    productCode: string;
    entityNumber: string;
    clientBankingDetails: string;
    agentBankingDetails?: string;
    bankReference: string;
    sourceOfFunds: string;
    parentTransaction?: string;
    withdrawalNodeType: "Parent" | "Child";
    transactionIdentifier: string;
    createdAtTime: number;
    transactionType: string;
    allocationStatus: string;
    transactionStatus: string;
    withdrawalTransactionProcess: string;
    description: string;
    sourceOfFundsAttachment: {
        url?: string, // if a source of fund description is provided ensure that an attachment is required
        reasonForNotAttaching: string
    }
    clientInstruction: {
        url?: string,
        reasonForNotAttaching: string
    }
    note?: string;
    capturedBy?: string;
    firstLevelApprover?: string;
    secondLevelApprover?: string;
}

export type WithdrawalTransactionStatus =
    | "Draft"
    | "First Level"
    | "Second Level"
    | "Payment Queue"
    | "Batched"
    | "Completed"
    | "Deleted"
    | "Corrected"
    | "Archived"
    | "Failed"
    | string;

export type WithdrawalAllocationStatus =
    | "Manually Recorded"
    | "Amended"
    | "Returned for Amendment"
    | "Submitted for Deletion"
    | string;

export type WithdrawalTransactionType =
    | "Manual"
    | "Recurring"
    | "Split"
    | "Manual Close Out"
    | "Online"
    | "Online Close Out"
    | string;

export type WithdrawalTransactionProcess =
    | "Normal"
    | "Back-Dated"
    | "Future-Dated"
    | string;

export type withdrawalNodeType = "Parent" | "Child";

export type Description =
    | "Manual Withdrawal"
    | "Manual Withdrawal (Draft)"
    | "Close Out Withdrawal"
    | "Split Withdrawal";

export type WithdrawalTransactionActions =
    | "Deleted"
    | "Restored from Deleted Transactions"
    | "Recorded"
    | "Returned for Amendment"
    | "Requested Source Of Funds"
    | "Submitted Source of Funds"
    | "Submitted for First Level Approval"
    | "Approved First Level"
    | "Approved Second Level"
    | "Amended, Updated and Saved"
    | "Amended and Submitted For First level"
    | "Split"
    | "Completed";

interface IWithdrawalTransactionCreatedAtTimes {
    transactionQueue?: number;
    firstLevelQueue?: number;
    secondLevelQueue?: number;
    paymentQueue?: number;
    batchFile?: number;
    completedQueue?: number;
    deletedQueue?: number;
    archivedQueue?: number;
}

export default class WithdrawalTransactionModel {
    private withdrawalTransaction: IWithdrawalTransaction;

    constructor(private store: AppStore, withdrawalTransaction: IWithdrawalTransaction) {
        makeAutoObservable(this);
        this.withdrawalTransaction = withdrawalTransaction;
    }

    get uploader() {
        return null
    }

    get asJson(): IWithdrawalTransaction {
        return toJS(this.withdrawalTransaction);
    }
}