import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultCessionInstruction: ICessionInstruction = {
    id: "",
    accountNumber: "",
    institution: "",
    notes: "",
    amount: 0,
    clientInstructionAttachment: {
        url: "",
        reasonForNoAttachment: ""
    },
    legalAgreement: {
        url: "",
        reasonForNoAttachment: ""
    },
    cessionStatus: "Active",
    loadedBy: "",
    dateLoaded: 0,
    cessionDescription: ""
}

export interface ICessionInstruction {
    id: string;
    accountNumber: string;
    institution: string;
    cessionDescription: string;
    notes: string;
    amount: number;
    clientInstructionAttachment: {
        url: string,
        reasonForNoAttachment: string;
    }
    legalAgreement: {
        url: string,
        reasonForNoAttachment: string;
    }
    cessionStatus: ICessionStatus;
    loadedBy: string;
    dateLoaded: number;
    firstLevelApprover?: string;
    dateApprovedFirstLevel?: number;
    secondLevelApprover?: string;
    dateApprovedSecondLevel?: number;
    dateUpliftedSecondLevel?: number;
    lastModified?: number;
}

type ICessionStatus = "Pending" | "First Level" | "Second Level" | "Active" | "Uplifted";

export default class CessionInstructionModel {
    private _cessionInstruction: ICessionInstruction;

    items = new Map<string, CessionInstructionModel>();

    constructor(private store: AppStore, cessionInstruction: ICessionInstruction) {
        makeAutoObservable(this);
        this._cessionInstruction = cessionInstruction;
    }

    get all() {
        return Array.from(toJS(this.items.values()));
    }

    get asJson(): ICessionInstruction {
        return toJS(this._cessionInstruction);
    }
}