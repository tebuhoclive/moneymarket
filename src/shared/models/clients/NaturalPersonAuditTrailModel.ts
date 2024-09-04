import { makeAutoObservable, toJS } from "mobx";
import { INaturalPerson, defaultNaturalPerson } from "./NaturalPersonModel";
import AppStore from "../../stores/AppStore";

export const defaultNaturalPersonAuditTrail: INaturalPersonAuditTrail = {
    id: "",
    auditDateTime: 0,
    action: "",
    actionDescription: "",
    dataStateBeforeAudit: {
        ...defaultNaturalPerson
    },
    dataStateAfterAudit: {
        ...defaultNaturalPerson
    },
    actionUser: "",
    auditType: "Profile Static Data Change"
}

export type ClientAuditTrailType = "Profile Static Data Change" | "Risk Rating" | "FIA Compliance"

export interface INaturalPersonAuditTrail {
    id: string;
    auditType: ClientAuditTrailType;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    dataStateBeforeAudit: INaturalPerson;
    dataStateAfterAudit: INaturalPerson;
    actionUser: string;
}

export default class NaturalPersonAuditTrailModel {
    private _naturalPersonAuditTrail: INaturalPersonAuditTrail;

    constructor(store: AppStore,naturalPersonAuditTrail: INaturalPersonAuditTrail) {
        makeAutoObservable(this);
        this._naturalPersonAuditTrail = naturalPersonAuditTrail;
    }

    get asJson(): INaturalPersonAuditTrail {
        return toJS(this._naturalPersonAuditTrail);
    }
}