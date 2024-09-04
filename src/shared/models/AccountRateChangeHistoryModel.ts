import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultAccountRateChangeHistory: IAccountRateChangeHistory= {
    id: "",
    rateChangeDate: 0,
    clientRate: 0,
    oldRate: 0,
    createdAt: 0,
    changedBy: "",
    status: "active",
}

export interface IAccountRateChangeHistory{
    id: string;
    rateChangeDate: number;
    clientRate: number;
    oldRate:number;
    createdAt: number;
    changedBy: string;
    status: string;
}


export default class AccountRateChangeHistoryModel {
    private _productRateChangeHistory: IAccountRateChangeHistory;

    constructor(private store: AppStore, productRateChangeHistory: IAccountRateChangeHistory) {
        makeAutoObservable(this);
        this._productRateChangeHistory = productRateChangeHistory;
    }

    get asJson(): IAccountRateChangeHistory{
        return toJS(this._productRateChangeHistory);
    }
}

