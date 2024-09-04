import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultTransactionReport: ITransactionReport = {
  id: "",
  isArchived: false
};

export interface ITransactionReport {
  id: string;
  isArchived: boolean;
}

export default class TransactionReport {
  private _transactionReport: ITransactionReport;

  constructor(private store: AppStore, transactionReport: ITransactionReport) {
    makeAutoObservable(this);
    this._transactionReport = transactionReport;
  }

  get asJson(): ITransactionReport {
    return toJS(this._transactionReport);
  }
}