import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultProduct: IProduct = {
    id: "",
    productCode: "",
    productName: "",
    productDescription: "",
    baseRate: 0,
    dailyFlowCutOffTime: 0,
    lastUpdated: 0,
    createdAt: Date.now(),
}

export interface IProduct {
    id: string;
    productCode: string;
    newProductCode?: string;
    productType?: string; //7 Day Call | Money Market Fund | Fixed Deposit
    isAccount?: boolean; //true: Account //false: Product
    productName: string;
    link?:string;
    assetLiability?:string;
    productDescription: string;
    baseRate: number;
    backUpBaseRate?: number;
    dailyFlowCutOffTime: number;
    lastUpdated: number;
    status?: string;
    createdAt: number;
}

export interface IProductUpdate {
    id: string;
    productCode: string;
    baseRate: number;
}

export const defaultProductRateChange: IProductRateChange = {
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
export interface IProductRateChange{
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

export type ProductRateChangeType = "Drop" | "Hike" | "Rate"

export interface IProductUpdateHistory {
    id: string;
    productCode: string;
    newBaseRate: number;
    oldBaseRate: number;
    effectiveDate: number;
    status: string
}

export default class ProductModel {
    private product: IProduct;

    constructor(private store: AppStore, product: IProduct) {
        makeAutoObservable(this);
        this.product = product;
    }

    get asJson(): IProduct {
        return toJS(this.product);
    }

    getAllLiabilityAccounts(){
        const products = this.store.product.all.filter(liabilities=>liabilities.asJson.assetLiability === 'Liability');
        
    }
}

