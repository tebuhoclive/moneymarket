import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultCloseOutDistribution: ICloseOutDistribution = {
  id: "",
  closeOffDate: 0,
  accountNumber: "",
  entity: "",
  currentBalance: 0,
  capitalisedAmount: 0,
  lastRate: 0,
  closeOutAmount: 0,
  bank: "",
  agency: "",
  instruction: "",
  reasonForNoInstruction: "",
  isPaymentProcessed: false,
  transactionId: "",
  processedDate: 0
};

export interface ICloseOutDistribution {

  id: string;
  closeOffDate: number; // system generated = current date/time
  accountNumber: string; //pulled from selected account
  entity: string; //pulled from selected account

  currentBalance: number; //pulled from selected account
  capitalisedAmount: number; //pulled from selected account (monthTotalInterest)
  lastRate: number; //pulled from selected account
  closeOutAmount: number; //calculated currentBalance + capitalisedAmount

  bank: string; //selected
  agency: string; // selected if choice is to pay to agent

  instruction: string; // uploaded file
  reasonForNoInstruction: string; // inserted if no file is uploaded

  isPaymentProcessed: boolean; // system generated when payment is marked successful in Batch
  transactionId: string; // the transaction (withdrawal) ID is linked (update) after marking payment as successful}
  completeActive?: boolean;

  processedDate: number;
}
/**
 * 1. Record the Close
 *  a. Record on Close Collection
 *  b. submit(create a withdrawal transaction using the close details and add description of "Close-Out") for 1st Level Approval and complete queue
 * 2. When paid then deduct capitalisedAmount from Early Distribution Account
 */

export default class CloseOutDistributionModel {
  private CloseOutDistribution: ICloseOutDistribution;

  constructor(
    private store: AppStore,
    CloseOutDistribution: ICloseOutDistribution
  ) {
    makeAutoObservable(this);
    this.CloseOutDistribution = CloseOutDistribution;
  }

  get uploader() {
    // return this.store.company.getById(this._companyDeduction.company);
    return null;
  }

  get asJson(): ICloseOutDistribution {
    return toJS(this.CloseOutDistribution);
  }
}
