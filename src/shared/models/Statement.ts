import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultDailyStatement: IDailyStatement = {
    id: "",
    date: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    balance: 0,
    rate: 0,
    interestBalance: 0,
    remark: ""
}

export interface IDailyStatement {
    id: string;
    date: number;
    totalDeposits: number;
    totalWithdrawals: number;
    balance: number;
    rate: number;
    interestBalance: number;
    remark: string;
}

export default class DailyStatementModel {
    private statement: IDailyStatement;

    constructor(private store: AppStore, statement: IDailyStatement) {
        makeAutoObservable(this);
        this.statement = statement;
    }

    get asJson(): IDailyStatement {
        return toJS(this.statement);
    }
}