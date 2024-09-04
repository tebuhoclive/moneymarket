import { makeAutoObservable, toJS } from "mobx";
import { InstrumentStatus } from "../../utils/utils";
import AppStore from "../../stores/AppStore";

export const defaultEquity: IEquity = {
    id: "",
    instrumentName: "",
    sharecode: "",
    bloombergCode: "",
    isin: "",
    instrumentStatus: "pending",
    price: 0
}

export interface IEquity {
    id: string;
    instrumentName: string;
    sharecode: string;
    bloombergCode: string;
    isin: string;
    instrumentStatus: InstrumentStatus;
    price: number;
}

export interface IEquityUpdate {
    id: string;
    sharecode: string;
    price: number;
}
export default class EquityModel {
    private equity: IEquity;

    constructor(private store: AppStore, equity: IEquity) {
        makeAutoObservable(this);
        this.equity = equity;
    }

    get asJson(): IEquity {
        return toJS(this.equity);
    }
}

