import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultStatementTransaction: IStatementTransaction = {
    id: "",
    date: Date.now(),
    transaction: "",
    balance: 0,
    rate: 0,
    remark: "",
    amount: 0,
    days: 0,
    createdAt: Date.now()
}

export interface IStatementTransaction {
    id: string;
    date: number;
    transaction: StatementTransactionTypes;
    amount: number;
    balance: number;
    previousBalance?: number;
    rate: number;
    days?: number;
    distribution?: number;
    remark: string;
    createdAt: number;
    blinded?: boolean;
    fromAccountId?:string;
    toAccountId?:string;
}

export type StatementTransactionTypes = '' | 'rateChange' | 'deposit' | 'switchFrom' | 'switchTo' | 'withdrawal' | 'capitalisation';

export default class StatementTransactionModel {
    private statement: IStatementTransaction;

    constructor(private store: AppStore, statement: IStatementTransaction) {
        makeAutoObservable(this);
        this.statement = statement;
    }

    get asJson(): IStatementTransaction {
        return toJS(this.statement);
    }

}