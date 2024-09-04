import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultProductDailyInflowTransaction: IProductDailyInflowTransaction= {
    id: "",
    entityId: "",
    productId: "",
    inflowId: "",
    accountNumber: "",
    transactionDate: Date.now(),
    amount: 0,
    bank: "",
}

export interface IProductDailyInflowTransaction{
    id: string;
    entityId: string;
    productId: string;
    inflowId: string;
    accountNumber: string;
    transactionDate: number;
    amount: number,
    bank: string;
}

export default class ProductDailyInflowTransactionModel {
    private _productDailyInflows: IProductDailyInflowTransaction;

    constructor(private store: AppStore, productDailyInflows: IProductDailyInflowTransaction) {
        makeAutoObservable(this);
        this._productDailyInflows = productDailyInflows;
    }

    get asJson(): IProductDailyInflowTransaction{
        return toJS(this._productDailyInflows);
    }
}