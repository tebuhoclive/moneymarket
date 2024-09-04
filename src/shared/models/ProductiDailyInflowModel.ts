import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultProductDailyInflow: IProductDailyInflow= {
    id: "",
    inflowDate: Date.now(),
    productId: "",
    openingBankBalance: "",
    closingBankBalance: "",
    withdrawalAmount: "",
    depositAmount: "",
    netflows: ""
}

export interface IProductDailyInflow{
    id: string;
    inflowDate: number;
    productId: string;
    openingBankBalance: string;
    closingBankBalance: string;
    withdrawalAmount: string;
    depositAmount: string;
    netflows: string;
}

export default class ProductDailyInflowModel {
    private _productDailyInflows: IProductDailyInflow;

    constructor(private store: AppStore, productDailyInflows: IProductDailyInflow) {
        makeAutoObservable(this);
        this._productDailyInflows = productDailyInflows;
    }

    get asJson(): IProductDailyInflow{
        return toJS(this._productDailyInflows);
    }
}