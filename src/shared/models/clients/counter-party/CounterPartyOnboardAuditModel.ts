import { makeAutoObservable, toJS } from "mobx";
import { ICounterParty } from "./CounterPartyModel";
import AppStore from "../../../stores/AppStore";

export interface ICounterPartyOnboardAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit:ICounterParty;
    dataStateAfterAudit:ICounterParty;
    actionUser: string;
}

export default class CounterPartyOnboardAuditModel {
    private CounterPartyAudit: ICounterPartyOnboardAudit;

    constructor(private store: AppStore, CounterPartyAudit: ICounterPartyOnboardAudit) {
        makeAutoObservable(this);
        this.CounterPartyAudit = CounterPartyAudit;
    }

    get asJson(): ICounterPartyOnboardAudit {
        return toJS(this.CounterPartyAudit);
    }
}