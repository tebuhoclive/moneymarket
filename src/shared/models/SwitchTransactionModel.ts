import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultSwitchTransaction: ISwitchTransaction = {
  id: "",
  transactionDate: 0,
  valueDate:0,
  fromAccount: "",
  toAccount: "",
  toEntityNumber: "",
  fromEntityNumber: "",
  amount: 0,
  switchStatus: "Pending",
  switchAction: "Completed",
  description: "",
  reference: "",
  createdAt: 0,
  switchedBy: "",
  transactionType: "",
  createdAtTime: {
    transactionQueue: Date.now()
  },
  clientInstruction: {
    url: "",
    reasonForNotAttaching: ""
  },
  switchTransactionProcess: "Normal",
  fromProductCode: "",
  toProductCode: "",
  reasonForDeleting:""
}

export interface ISwitchTransaction {
  id: string;
  transactionDate: number;
  valueDate:number
  fromAccount: string;
  toAccount: string;
  toEntityNumber: string;
  fromEntityNumber: string;
  amount: number;
  switchStatus: SwitchTransactionStatus;
  switchAction: SwitchTransactionActions;
  switchTransactionProcess: SwitchTransactionProcess,
  description: string;
  reference: string;
  createdAt: number;
  fromProductCode: string;
  toProductCode: string;
  switchedBy: string;
  transactionType: SwitchTransactionType;
  createdAtTime: ISwitchTransactionCreatedAtTimes; //used to store/update timestamps for each queue that the transaction moves to
  clientInstruction: {
    url?: string;
    reasonForNotAttaching: string;
  };
  returnNote?: string;
  reasonForDeleting?:string;
  transactionNotes?: string;
  closeOutInterest?: number;
  closeOutDays?: number;
}

//for queue
export interface ISwitchTransactionQueueData {
  index: string,
  id: string;
  transactionDate: number,
  valueDate: number;
  amount: number;
  fromAccount: string;
  toAccount: string;
  fromProductCode: string;
  toProductCode: string;
  fromEntityNumber: string;
  toEntityNumber: string;
  reference: string;
  createdAtTime: number;
  transactionType: string;
  switchStatus: string;
  switchTransactionProcess: string;
  description: string;
  clientInstruction: {
    url?: string;
    reasonForNotAttaching: string;
  };
  returnNote?: string;
  reasonForDeleting?:string;
}


export type SwitchTransactionActions =
  'Submitted for 1st Approval'
  | 'Submitted for 2nd Approval'
  | 'Returned for Amendment'
  | 'Deleted'
  | 'Requested by Client'
  | 'Recorded'
  | 'Added from Instruction Mail box'
  | 'Completed'
  | "Amended"
  | "Saved"
  | "Restored from Deleted Transactions"
  | "Archived"
export type SwitchTransactionType =
  | "Manual Switch"
  | "Online Switch"
  | "Manual Switch Close Out"
  | "Online Switch Close Out"
  | string;

export type SwitchTransactionStatus =
  | "Draft"
  | "First Level"
  | "Second Level"
  | "Completed"
  | "Deleted"
  | "Corrected"
  | "Archived"
  | string;

export type SwitchTransactionProcess =
  | "Normal"
  | "Back-Dated"
  | "Future-Dated"
  | string;



interface ISwitchTransactionCreatedAtTimes {
  transactionQueue?: number;
  firstLevelQueue?: number;
  secondLevelQueue?: number;
  completedQueue?: number;
  deletedQueue?: number;
  archivedQueue?: number;
}


export default class SwitchTransactionModel {
  private _switchTransaction: ISwitchTransaction;

  constructor(private store: AppStore, switchTransaction: ISwitchTransaction) {
    makeAutoObservable(this);
    this._switchTransaction = switchTransaction;
  }

  get asJson(): ISwitchTransaction {
    return toJS(this._switchTransaction);
  }
}