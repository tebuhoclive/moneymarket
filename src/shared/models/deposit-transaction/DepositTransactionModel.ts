import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IDepositTransaction {
  id: string;
  bankTransactionDate?: number; //the date the transaction was created on the banking system : pulled from the statement
  bankValueDate?: number; //the date on which the transaction was actioned on by the bank : pulled from the statement
  transactionDate: number; //the date the transaction was created in the system. System Generated (when statement is uploaded and when transaction is recorded)
  valueDate: number; //the date on which the transaction should actioned on
  amount: number; //the transaction amount
  accountNumber: string; //the money market account number
  productCode: string;
  entityNumber: string; // the entityNumber of the client who owns the accountNumber
  sourceBank: string; // the Bank Account ID in which the transaction was created, the banks are stored in the system
  bankReference: string; //the statement that should appear as the money market account statement transaction remark
  //files
  sourceOfFundsAttachment: {
    url?: string; // if a source of fund description is provided ensure that an attachment is required
    reasonForNotAttaching: string;
  };
  proofOfPaymentAttachment: {
    url?: string;
    reasonForNotAttaching: string;
  };
  sourceOfFunds: string; // this is the source of funds description
  reasonForFutureDating?:string;
  reasonForBackDating?:string;
  parentTransaction?: string; //every transaction that is part of a split deposit should be assigned the ID of the main transaction
  depositNodeType: depositNodeType; //determines whether the transaction is a Parent or a Child
  statementIdentifier: string; //is used to uniquely identify a transaction

  createdAtTime: ITransactionCreatedAtTimes; //used to store/update timestamps for each queue that the transaction moves to
  transactionAction?: DepositTransactionActions;
  transactionType: depositTransactionType; //this is defined by the method used to capture the transaction
  allocationStatus: depositAllocationStatus; //this is status of the transaction that will define what functions can be executed on the transaction
  transactionStatus: depositTransactionStatus; //this is status of the transaction that will indicate what queue it is currently on
  depositTransactionProcess: depositTransactionProcess; //this determines how the transaction should be processed for completion
  description: string;
  note?: string;
  //new fields
  emailAddress?: string;
  capturedBy?: string;
  firstLevelApprover?: string;
  secondLevelApprover?: string;
  accountName?: string;
  archivedBy?:string;
}

type depositTransactionStatus =
  | "Draft"
  | "Transaction Queue"
  | "Non-Deposit"
  | "Unallocated"
  | "First Level"
  | "Second Level"
  | "Completed"
  | "Deleted"
  | "Corrected"
  | "Archived"
  
  | string;

type depositAllocationStatus =
  | "Manually Allocated"
  | "Amended"
  | "Returned for Amendment"
  | "Auto-Allocated"
  | "Unallocated"
  | string;

type depositTransactionType =
  | "Manual"
  | "Split"
  | "CSV File"
  | "Online"
  | string;

export type depositTransactionProcess =
  | "Normal"
  | "Back-Dated"
  | "Future-Dated"
  | string;

// interface ITransactionNotes {
//   id: string;
//   note: string;
//   queue: depositTransactionStatus;
//   createdAt: number;
//   createdBy: string;
// }

export const defaultDepositTransaction: IDepositTransaction = {
  id: "",
  transactionDate: 0,
  valueDate: 0,
  amount: 0,
  accountNumber: "",
  productCode: "",
  entityNumber: "",
  bankReference: "",

  sourceOfFundsAttachment: {
    url: "",
    reasonForNotAttaching: "",
  },

  proofOfPaymentAttachment: {
    url: "",
    reasonForNotAttaching: "",
  },

  createdAtTime: {
    transactionQueue: Date.now(),
  },

  transactionType: "Manual",
  transactionAction: "Recorded",
  allocationStatus: "Manually Allocated",
  depositTransactionProcess: "Normal",
  depositNodeType: "Parent",
  transactionStatus: "Draft",
  statementIdentifier: "",
  sourceOfFunds: "",
  sourceBank: "",
  emailAddress: "",
  capturedBy: "",
  firstLevelApprover: "",
  secondLevelApprover: "",
  description: "",
};

export type depositNodeType = "Parent" | "Child";

export type Description =
  | "Uploaded: Un-allocated"
  | "Manual Deposit"
  | "Manual Deposit (Draft)"
  | "Uploaded: Auto-Allocated"
  | "Split Deposit";

export type DepositTransactionActions =
  | "Deleted"
  | "Restored from Non-Deposit Transactions"
  | "Restored from Deleted Transactions"
  | "Uploaded"
  | "Recorded"
  | "Marked as a Non Deposit"
  | "Marked as Un Allocated"
  | "Unallocated"
  | "Auto Allocated"
  | "Returned for Amendment"
  | "Requested Source Of Funds"
  | "Submitted Source of Funds"
  | "Submitted for First Level Approval"
  | "Approved First Level"
  | "Approved Second Level"
  | "Amended, Updated and Saved"
  | "Amended and Submitted For First level"
  | "Split"
   | "Archived"
  | "Completed"
  |"Restored Archive";

interface ITransactionCreatedAtTimes {
  transactionQueue?: number;
  nonDepositsQueue?: number;
  unAllocatedQueue?: number;
  firstLevelQueue?: number;
  secondLevelQueue?: number;
  completedQueue?: number;
  deletedQueue?: number;
  archivedQueue?: number;
}
export default class DepositTransactionModel {
  private depositTransaction: IDepositTransaction;

  constructor(
    private store: AppStore,
    depositTransaction: IDepositTransaction
  ) {
    makeAutoObservable(this);
    this.depositTransaction = depositTransaction;
  }

  get asJson(): IDepositTransaction {
    return toJS(this.depositTransaction);
  }
  getChildTransactions(parentId: string): IDepositTransaction[] {
    const transactions = this.store.depositTransaction.all
      .filter(
        (transaction) => transaction.asJson.parentTransaction === parentId
      )
      .map((transaction) => transaction.asJson);
    return transactions;
  }
}
