import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { InstrumentStatus } from "../../utils/utils";

export const defaultUnitTrust: IUnitTrust = {
    id: "",
    instrumentName: "",
    sharecode: "",
    bloombergCode: "",
    instrumentStatus: "pending",
    price: 0
}

export interface IUnitTrust {
    id: string;
    instrumentName: string;
    sharecode: string;
    bloombergCode: string;
    instrumentStatus: InstrumentStatus;
    price: number;
}

export interface IUnitTrustUpdate {
    id: string;
    sharecode: string;
    price: number;
}

export default class UnitTrustModel {
    private unitTrust: IUnitTrust;

    constructor(private store: AppStore, unitTrust: IUnitTrust) {
        makeAutoObservable(this);
        this.unitTrust = unitTrust;
    }

    get asJson(): IUnitTrust {
        return toJS(this.unitTrust);
    }
}

