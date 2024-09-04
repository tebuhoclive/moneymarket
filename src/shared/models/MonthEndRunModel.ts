import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultMonthEndRun: IMonthEndRun = {
  id: "",
  date: Date.now(),
  status: "Pending",
  runStartTime: 0,
  runEndTime: 0,
  processedAccounts: [],
  rolledBackAccounts: [],
  year: "",
  month: "",
  productName: "",
  productCode: ""
};

export interface IMonthEndRun {
  id: string;
  year: string;
  month:string;
  date: number; //date on which the month end was run (selected by user at initiation)
  status: MonthEndRunStatus;
  runStartTime: number; // time which the month end was executed
  runEndTime: number; // time which the month end was completed
  processedAccounts: IProcessedAccount[]; // meta data on the accounts which where capitalised during the run
  rolledBackAccounts: IRolledBackAccount[]; // meta data on the accounts which where rolled back during the run
  productName: string;
  productCode: string;
  
}

export interface IProcessedAccount {
  id: string;
  account: string; //account ID to fetch account meta data
  accountType: string;
  totalInterest: number; //total interest added to account on that month
  days?: number;
  lastRate?: number;
  lastBalance?: number;
  fees?: number;
}

export interface IRolledBackAccount {
  id: string;
  account: string; //account ID to fetch account meta data
  accountType: string;
  totalInterest: number; //total interest added to account on that month
  days?: number;
  lastRate?: number;
  lastBalance?: number;
  fees?: number;
}

export type MonthEndRunStatus =
  | "Pending"
  | "In-progress"
  | "Failed"
  | "Completed"
  | "Halted";

export default class MonthEndRunModel {
  private statement: IMonthEndRun;

  constructor(private store: AppStore, statement: IMonthEndRun) {
    makeAutoObservable(this);
    this.statement = statement;
  }

  get asJson(): IMonthEndRun {
    return toJS(this.statement);
  }
}
