import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultRecurringWithdrawalInstruction: IRecurringWithdrawalInstruction = {
    id: "",
    reference: "",
    description: "",
    amount: 0,
    transactionDate: Date.now(),
    entity: "",
    allocation: "",
    allocationStatus: "Pending",
    transactionStatus: "Pending",
    bank: "",
    instruction: "",
    reasonForNoInstruction: "",
    recurringDay:0 ,
    valueDate: null,
    useAgent: false,
}

export interface IRecurringWithdrawalInstruction {
  id: string;
  amount: number;
  reference: string;
  email?: string;
  description: string;
  transactionDate: number | null;
  valueDate: number | null;
  entity: string;
  allocation: string;
  allocationStatus: RecurringWithdrawalTransactionStatus;
  transactionStatus: RecurringWithdrawalTransactionStatus;
  bank: string;
  instruction: string;
  reasonForNoInstruction: string;
  recurringDay: number | null;
  timeCreated?: string;
  timeVerified?: string;
  whoAuthorized?: string;
  timeAuthorized?: string;
  timeProcessPayment?: string;
  executionTime?: string;
  previousBalance?: number;
  batchStatus?: boolean; // use for transactions in client withdrawal payments
  batchTransactionStatus?: string; //use for transactions in the batch file
  isPaymentProcessed?: boolean;
  productCode?: string;
  useAgent?: boolean;
  transactionAction?: RecurringWithdrawalTransactionActions; // used for audit trail
  returnNote?: string;

}

export type RecurringWithdrawalTransactionStatus = 'Pending' | 'Awaiting Verification'| 'Approved' | 'Stopped' | 'Deleted'|'Verified';

export type RecurringWithdrawalTransactionActions = 'Requested by Client' | 'Loaded by User' | 'Approved by User' | 'Stopped by Client' | 'Stopped by User'|'Returned for Amendment';

export default class RecurringWithdrawalInstructionModel {
    private RecurringWithdrawalInstruction: IRecurringWithdrawalInstruction;

    constructor(private store: AppStore, RecurringWithdrawalInstruction: IRecurringWithdrawalInstruction) {
        makeAutoObservable(this);
        this.RecurringWithdrawalInstruction = RecurringWithdrawalInstruction;
    }

    get uploader() {
        // return this.store.company.getById(this._companyDeduction.company);
        return null
    }

    get asJson(): IRecurringWithdrawalInstruction {
        return toJS(this.RecurringWithdrawalInstruction);
    }
}