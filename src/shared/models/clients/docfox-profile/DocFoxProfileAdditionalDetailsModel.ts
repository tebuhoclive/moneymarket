import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultKYCProfileAdditionalDetails: IDocFoxProfileAdditionalDetails = {
    id: "",
    nationality: "",
    bankAccountNumber: "",
    employerName: "",
    bankName: "",
    occupation: "",
    dateOfBirth: "",
    bankAccountType: "",
    bankBranchName: "",
    bankBranchCode: ""

}
export interface IDocFoxProfileAdditionalDetails {
    id: string;
    nationality: string;
    bankAccountNumber: string;
    employerName: string;
    bankName: string;
    occupation: string;
    dateOfBirth: string;
    bankAccountType: string;
    bankBranchName: string;
    bankBranchCode: string,
}

export default class DocFoxProfileAdditionDetailsModel {
    private DocFoxProfileAdditionDetails: IDocFoxProfileAdditionalDetails;

    constructor(private store: AppStore, DocFoxProfileAdditionDetails: IDocFoxProfileAdditionalDetails) {
        makeAutoObservable(this);
        this.DocFoxProfileAdditionDetails = DocFoxProfileAdditionDetails;
    }

    get asJson(): IDocFoxProfileAdditionalDetails {
        return toJS(this.DocFoxProfileAdditionDetails);
    }
}