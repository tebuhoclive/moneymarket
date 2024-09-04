import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface IEquityDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultEquityDeskDealingSheet: IEquityDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class EquityDeskDealingSheetModel {
    private _deskDealingSheet: IEquityDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: IEquityDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): IEquityDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}