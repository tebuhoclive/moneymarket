import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

/**
 * Group by productCode, then group by the cut-off time,and then finally group by the accountNumber and sort by client name ascending
 * 
 * 1. After every transaction
 */

export const defaultDailyTransactionReport: IDailyTransactionReport = {
    id: "",
    reportDate: 0,
    netPosition: 0,
    isDailyFlowProcessExecuted: false,
    cutOffTime: 0,
    reportMetaData: []
};

export interface IDailyTransactionReport{
    id: string, 
    reportDate: 0, 
    reportMetaData: IDailyTransactionReportMetaData[],
    netPosition: number,
    isDailyFlowProcessExecuted: boolean,
    cutOffTime: number,
}

export interface IDailyTransactionReportMetaData {
    id:string, 
    transactionDate: number,
    productCode: string, 
    clientName: string, 
    accountNumber: string,
    deposit: number,
    withdrawal: number, 
    switchFrom: number, 
    switchTo: number, 
    netPosition: number,
    clientBalance: number,
}

export default class DailyTransactionReport {
  private file: IDailyTransactionReport;

  constructor(private store: AppStore, file: IDailyTransactionReport) {
    makeAutoObservable(this);
    this.file = file;
  }

  get asJson(): IDailyTransactionReport {
    return toJS(this.file);
  }
}