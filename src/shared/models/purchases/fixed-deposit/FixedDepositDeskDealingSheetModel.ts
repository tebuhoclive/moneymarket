import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface IFixedDepositDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultFixedDepositDeskDealingSheet: IFixedDepositDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class FixedDepositDeskDealingSheetModel {
    private _deskDealingSheet: IFixedDepositDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: IFixedDepositDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): IFixedDepositDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}