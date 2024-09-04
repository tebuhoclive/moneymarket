import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

/**
 * Group by productCode and the group by the accountNumber and sort by client name ascending
 */

export const defaultDailyBalanceReport: IDailyBalanceReport = {
  id: "",
  reportDate: 0,
  reportMetaData: [],
  cutOffTime: 0,
  productCode: "",
  fundBalance: 0
};

export interface IDailyBalanceReport {
  id: string,
  reportDate: number;
  productCode: string;
  reportMetaData: IDailyBalanceReportMetaData[];
  cutOffTime: number;
  fundBalance: number;
}

export interface IDailyBalanceReportMetaData {
  client: string; //client Entity ID
  account: string;  // client money market account number
  accountBalance: string;
}

export default class DailyBalanceReport {
  private _dailyBalanceReport: IDailyBalanceReport;

  constructor(private store: AppStore, dailyBalanceReport: IDailyBalanceReport) {
    makeAutoObservable(this);
    this._dailyBalanceReport = dailyBalanceReport;
  }

  get asJson(): IDailyBalanceReport {
    return toJS(this._dailyBalanceReport);
  }
}