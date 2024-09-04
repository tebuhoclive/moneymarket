import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export interface ICallDepositDeskDealingSheet {
    id: string,
    instrumentName: string;
    settlementDate: number;
    maturityDate: number;
    nominal: number,
    tenderRate: number,
    considerationBON: number,
}

export const defaultCallDepositDeskDealingSheet: ICallDepositDeskDealingSheet = {
    id: "",
    instrumentName: "",
    settlementDate: 0,
    maturityDate: 0,
    nominal: 0,
    tenderRate: 0,
    considerationBON: 0,
}

export default class CallDepositDeskDealingSheetModel {
    private _deskDealingSheet: ICallDepositDeskDealingSheet;

    constructor(private store: AppStore, _deskDealingSheet: ICallDepositDeskDealingSheet) {
        makeAutoObservable(this);
        this._deskDealingSheet = _deskDealingSheet;
    }

    get asJson(): ICallDepositDeskDealingSheet {
        return toJS(this._deskDealingSheet);
    }
}