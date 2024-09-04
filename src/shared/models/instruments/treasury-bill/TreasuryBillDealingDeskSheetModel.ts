import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface ITreasuryBillDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultTreasuryBillDeskDealingSheet: ITreasuryBillDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class TreasuryBillDeskDealingSheetModel {
    private _deskDealingSheet: ITreasuryBillDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: ITreasuryBillDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): ITreasuryBillDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}