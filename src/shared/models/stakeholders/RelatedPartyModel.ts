import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultRelatedParty: IRelatedParty = {
    id: "",
    stakeholderId: "",
    firstName: "",
    surname: "",
    stakeholderDisplayName: "",
    idType: "",
    idNumber: "",
    idCountry: "",
    emailAddress: "",
    relationship: "",
    riskRating: "",
    dateCreated: 0,
    lastUpdated: 0
}

export interface IRelatedParty {
    id: string;
    stakeholderId: string;
    firstName: string;
    surname: string;
    stakeholderDisplayName: string;

    idType: string;
    idNumber: string;
    idCountry: string;
    idExpiryDate?: string;

    emailAddress: string;

    relationship: string;
    riskRating: string;

    supportingDocuments?: IRelatedPartySupportingDocuments;

    dateCreated: number;
    lastUpdated: number;
}

interface IRelatedPartySupportingDocuments {
    copyOfId?: string;
    reasonForNoCopyOfId?: string;
}

export default class RelatedPartyModel {
    private relatedParty: IRelatedParty;

    constructor(private store: AppStore, relatedParty: IRelatedParty) {
        makeAutoObservable(this);
        this.relatedParty = relatedParty;
    }

    get asJson(): IRelatedParty {
        return toJS(this.relatedParty);
    }
}