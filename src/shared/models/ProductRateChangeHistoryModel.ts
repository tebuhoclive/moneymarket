import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";
import { ProductRateChangeType } from "./ProductModel";

export const defaultProductRateChangeHistory: IProductRateChangeHistory = {
    id: "",
    productCode: "",
    basisPoints: 0,
    productRate: 0,
    rateChangeType: "Drop",
    effectiveDate: 0,
    changedAt: 0,
    changedBy: "",
    status: "effective"
}

export interface IProductRateChangeHistory {
    id: string,
    productCode: string;
    basisPoints: number;
    productRate: number;
    rateChangeType: ProductRateChangeType;
    effectiveDate: number; //the date the rate change statement transaction appears on
    changedAt: number;
    changedBy: string; //uid
    status: string;
}


export default class ProductRateChangeHistoryModel {
    private _productRateChangeHistory: IProductRateChangeHistory;

    constructor(private store: AppStore, productRateChangeHistory: IProductRateChangeHistory) {
        makeAutoObservable(this);
        this._productRateChangeHistory = productRateChangeHistory;
    }

    get asJson(): IProductRateChangeHistory {
        return toJS(this._productRateChangeHistory);
    }
}

