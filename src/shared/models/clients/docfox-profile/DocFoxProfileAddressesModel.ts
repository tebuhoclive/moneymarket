import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultKYCProfileAddresses: IDocFoxProfileAddresses = {
    id: "",
    physical: {
        address_line_one: "",
        address_line_two: "",
        city: "",
        country: "",
        state: "",
        suburb: ""
    },
    postal: ""
}
export interface IDocFoxProfileAddresses {
    id:string;
    physical: {
        address_line_one: string;
        address_line_two: string;
        city: string;
        country: string;
        state: string;
        suburb: string;
    };
    postal: string;

}

export default class DocFoxProfileAddressesModel {
    private DocFoxProfileAddresses: IDocFoxProfileAddresses;

    constructor(private store: AppStore, DocFoxProfileAddresses: IDocFoxProfileAddresses) {
        makeAutoObservable(this);
        this.DocFoxProfileAddresses = DocFoxProfileAddresses;
    }

    get asJson(): IDocFoxProfileAddresses {
        return toJS(this.DocFoxProfileAddresses);
    }
}