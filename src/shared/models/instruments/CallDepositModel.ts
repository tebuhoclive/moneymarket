import { makeAutoObservable, toJS } from "mobx";
import { InstrumentStatus } from "../../utils/utils";
import AppStore from "../../stores/AppStore";

export const defaultCallDeposit: ICallDeposit = {
    id: "",
    instrumentName: "",
    maturityDate: null,
    issuer: "",
    interestRate: 0,
    instrumentStatus: "pending",
}

export interface ICallDeposit {
    id: string;
    instrumentName: string;
    maturityDate: number | null;
    issuer: string;
    interestRate: number;
    instrumentStatus: InstrumentStatus;
}
export default class CallDepositModel {
    private instrument: ICallDeposit;

    constructor(private store: AppStore, instrument: ICallDeposit) {
        makeAutoObservable(this);
        this.instrument = instrument;
    }

    get asJson(): ICallDeposit {
        return toJS(this.instrument);
    }
}

