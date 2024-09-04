import { makeAutoObservable, toJS } from "mobx";
import { InstrumentStatus } from "../../utils/utils";
import AppStore from "../../stores/AppStore";

export const defaultFixedDeposit: IFixedDeposit = {
    id: "",
    instrumentName: "",
    maturityDate: null,
    issuer: "",
    interestRate: 0,
    instrumentStatus: "pending",
}

export interface IFixedDeposit {
    id: string;
    instrumentName: string;
    maturityDate: number | null;
    issuer: string;
    interestRate: number;
    instrumentStatus: InstrumentStatus;
}
export default class FixedDepositModel {
    private instrument: IFixedDeposit;

    constructor(private store: AppStore, instrument: IFixedDeposit) {
        makeAutoObservable(this);
        this.instrument = instrument;
    }

    get asJson(): IFixedDeposit {
        return toJS(this.instrument);
    }
}

