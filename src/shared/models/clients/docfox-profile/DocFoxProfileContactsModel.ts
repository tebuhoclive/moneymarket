import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultKYCProfileContacts: IDocFoxProfileContacts = {
    id: "",
    emailAddress: "",
    emailAddressSecondary: "",
    cellphoneNumber: "",
    cellphoneNumberSecondary: "",
    workNumber: "",
    workNumberSecondary: ""
}
export interface IDocFoxProfileContacts {
    id: string;
    emailAddress: string;
    emailAddressSecondary: string;
    cellphoneNumber: string;
    cellphoneNumberSecondary: string;
    workNumber: string;
    workNumberSecondary: string;
}

export default class DocFoxProfileContactsModel {
    private DocFoxProfileContacts: IDocFoxProfileContacts;

    constructor(private store: AppStore, DocFoxProfileContacts: IDocFoxProfileContacts) {
        makeAutoObservable(this);
        this.DocFoxProfileContacts = DocFoxProfileContacts;
    }

    get asJson(): IDocFoxProfileContacts {
        return toJS(this.DocFoxProfileContacts);
    }
}