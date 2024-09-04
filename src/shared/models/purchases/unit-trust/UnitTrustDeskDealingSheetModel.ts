import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface IUnitTrustDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultUnitTrustDeskDealingSheet: IUnitTrustDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class UnitTrustDeskDealingSheetModel {
    private _deskDealingSheet: IUnitTrustDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: IUnitTrustDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): IUnitTrustDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}