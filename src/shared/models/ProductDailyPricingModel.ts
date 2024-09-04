import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultProduct: IProductDailyPricing = {
    id: "",
    productCode: "",
    priceUpdateDate: Date.now(),
    oldRate: 0,
    newRate: 0,
    // dailyPricingFile: null
}

export interface IProductDailyPricing {
    id: string;
    productCode: string;
    priceUpdateDate: number,
    oldRate: number;
    newRate: number;
    // dailyPricingFile: string | null;
}

export default class ProductDailyPricingModel {
    private product: IProductDailyPricing;

    constructor(private store: AppStore, product: IProductDailyPricing) {
        makeAutoObservable(this);
        this.product = product;
    }

    get asJson(): IProductDailyPricing {
        return toJS(this.product);
    }
}