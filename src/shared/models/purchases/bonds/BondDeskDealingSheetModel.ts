import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface IBondDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultBondDeskDealingSheet: IBondDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class BondDeskDealingSheetModel {
    private _deskDealingSheet: IBondDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: IBondDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): IBondDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}