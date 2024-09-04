import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";
import { ISwitchTransaction } from "./SwitchTransactionModel";

export const defaultSwitchAudit: ISwitchAudit = {
    id: "",
    auditDateTime: 0,
    action: "",
    actionDescription: "",

    actionUser: "",
}

export interface ISwitchAudit {
    id: string;
    auditDateTime: number;
    action: string;
    actionDescription: string;
    actionUser: string;
}

export default class SwitchAuditModel {
    private SwitchAudit: ISwitchAudit;

    constructor(private store: AppStore, SwitchAudit: ISwitchAudit) {
        makeAutoObservable(this);
        this.SwitchAudit = SwitchAudit;
    }

    get asJson(): ISwitchAudit {
        return toJS(this.SwitchAudit);
    }
}