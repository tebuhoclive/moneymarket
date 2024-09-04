import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";
import { ICessionInstruction } from "./CessionInstructionModel";

export const defaultProduct: ICessionInstructionAuditTrail = {
    id: "",
    auditDateTime: Date.now(),
    action: "Loaded",
    actionDescription: "",
    actionUser: ""
}

export interface ICessionInstructionAuditTrail {
    id: string;
    auditDateTime: number;
    action: ICessionAction;
    actionDescription: string;
    dataStateBeforeAudit?:ICessionInstruction;
    dataStateAfterAudit?:ICessionInstruction;
    actionUser: string;
}

type ICessionAction = "Loaded" | "Amended" | "Submitted for Approval" | "Approved First Level" | "Approved Second Level" |"Uplifted";

export default class CessionInstructionAuditTrailModel {
    private _cessionInstruction: ICessionInstructionAuditTrail;

    items = new Map<string, CessionInstructionAuditTrailModel>();

    constructor(private store: AppStore, cessionInstruction: ICessionInstructionAuditTrail) {
        makeAutoObservable(this);
        this._cessionInstruction = cessionInstruction;
    }

    get all() {
        return Array.from(toJS(this.items.values()));
    }

    get asJson(): ICessionInstructionAuditTrail {
        return toJS(this._cessionInstruction);
    }
}