import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultTransactionOutflow: ITransactionOutflow = {
    id: "",
    transactionDate: Date.now(),
    amount: 0,
    bank: "",
    product: "",
    status: "running"
}

export interface ITransactionOutflow {
    id: string;
    transactionDate: number;
    amount: number;
    bank: string;
    product: string;
    status: ITransactionInflowStatus;
}

export type ITransactionInflowStatus = 'withdrawn' | 'running';


export default class TransactionOutflowModel {
    private _tranasactionInflow: ITransactionOutflow;

    constructor(private store: AppStore, tranasactionInflow: ITransactionOutflow) {
        makeAutoObservable(this);
        this._tranasactionInflow = tranasactionInflow;
    }

    get asJson(): ITransactionOutflow {
        return toJS(this._tranasactionInflow);
    }
}