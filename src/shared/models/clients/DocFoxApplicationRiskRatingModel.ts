import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export const defaultKYCApplication: IDocFoxApplicationRiskRatings = {
    id: "",
    status: "",
    color: "",
    isPIP: false,
    rating: "",
    riskScore: 0,
    createdAt: 0,
    updatedAt: 0,
}
export interface IDocFoxApplicationRiskRatings {
    id: string; //KYC Application ID
    status: string;
    color: string;
    isPIP: boolean;
    rating: string;
    riskScore: number;
    createdAt: number;
    updatedAt: number;
}

export default class DocFoxApplicationRiskRatingsModel {
    private docFoxApplicationRiskRating: IDocFoxApplicationRiskRatings;

    constructor(private store: AppStore, docFoxApplicationRiskRating: IDocFoxApplicationRiskRatings) {
        makeAutoObservable(this);
        this.docFoxApplicationRiskRating = docFoxApplicationRiskRating;
    }

    get asJson(): IDocFoxApplicationRiskRatings {
        return toJS(this.docFoxApplicationRiskRating);
    }
}