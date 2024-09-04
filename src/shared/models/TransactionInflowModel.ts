import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultTransactionInflow: ITransactionInflow = {
    id: "",
    transactionDate: Date.now(),
    amount: 0,
    bank: "",
    product: "",
    status: "running"
}

export interface ITransactionInflow {
    id: string;
    transactionDate: number;
    amount: number;
    bank: string;
    product: string;
    status: ITransactionInflowStatus;
}

export type ITransactionInflowStatus = 'deposited' | 'running';

export default class TransactionInflowModel {
    private _tranasactionInflow: ITransactionInflow;

    constructor(private store: AppStore, tranasactionInflow: ITransactionInflow) {
        makeAutoObservable(this);
        this._tranasactionInflow = tranasactionInflow;
    }

    get asJson(): ITransactionInflow {
        return toJS(this._tranasactionInflow);
    }
}