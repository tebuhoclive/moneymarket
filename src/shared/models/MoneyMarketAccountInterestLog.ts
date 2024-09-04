import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultMoneyAccountInterestLog: IMoneyMarketAccountInterestLog = {
    id: "",
    interestLogDate: 0,
    interest: 0,
    fee: 0,
    runningBalance: 0,
    accountBalance: 0
}

export interface IMoneyMarketAccountInterestLog {
    id: string;
    interestLogDate: number;
    fee: number;
    interest: number;
    runningBalance: number;
    accountBalance: number;
  }

export default class MoneyMarketAccountInterestLogModel {
    private account: IMoneyMarketAccountInterestLog;

    constructor(private store: AppStore, account: IMoneyMarketAccountInterestLog) {
        makeAutoObservable(this);
        this.account = account;
    }

    get asJson(): IMoneyMarketAccountInterestLog {
        return toJS(this.account);
    }
}