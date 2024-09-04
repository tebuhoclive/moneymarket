import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultKYCProfileNames: IDocFoxProfile = {
    id: "",
    kycApplicationId: "",
    firstName: "",
    lastName: "",
    entityType: "",
    systemOnBoardingStatus:"pending",
}
export interface IDocFoxProfile {
    id:string; //KYC Profile ID
    kycApplicationId: string;
    firstName: string,
    lastName: string,
    entityType: string;
    systemOnBoardingStatus: ISystemOnBoardingStatus;
}

type ISystemOnBoardingStatus = 'pending' | 'in-progress' | 'on-boarded';

export default class DocFoxProfileNamesModel {
    private DocFoxProfileNames: IDocFoxProfile;

    constructor(private store: AppStore, DocFoxProfileNames: IDocFoxProfile) {
        makeAutoObservable(this);
        this.DocFoxProfileNames = DocFoxProfileNames;
    }

    get asJson(): IDocFoxProfile {
        return toJS(this.DocFoxProfileNames);
    }
}