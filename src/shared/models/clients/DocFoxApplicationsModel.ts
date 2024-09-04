import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultKYCApplication: IDocFoxApplications = {
    id: "",
    kycEntityType: "",
    kycProfileId: ""
}
export interface IDocFoxApplications {
    id:string; //KYC Application ID
    kycEntityType: string,
    kycProfileId: string
}

export default class DocFoxApplicationsModel {
    private docFoxApplication: IDocFoxApplications;

    constructor(private store: AppStore, docFoxApplication: IDocFoxApplications) {
        makeAutoObservable(this);
        this.docFoxApplication = docFoxApplication;
    }

    get asJson(): IDocFoxApplications {
        return toJS(this.docFoxApplication);
    }
}