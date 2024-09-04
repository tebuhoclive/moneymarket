import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultKYCProfileNumbers: IDocFoxProfileNumbers = {
    id: "",
    idExpiry: null,
    idCountry: "",
    idType: "",
    idNumber: ""
}
export interface IDocFoxProfileNumbers {
    id: string,
    idExpiry: string | null
    idCountry: string
    idType: string
    idNumber: string
}

export default class DocFoxProfileNumbersModel {
    private DocFoxProfileNumbers: IDocFoxProfileNumbers;

    constructor(private store: AppStore, DocFoxProfileNumbers: IDocFoxProfileNumbers) {
        makeAutoObservable(this);
        this.DocFoxProfileNumbers = DocFoxProfileNumbers;
    }

    get asJson(): IDocFoxProfileNumbers {
        return toJS(this.DocFoxProfileNumbers);
    }
}