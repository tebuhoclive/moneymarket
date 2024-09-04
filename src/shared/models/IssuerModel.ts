import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultIssuer: IIssuer = {
    id: "",
    issuerName: "",
}

export interface IIssuer {
    id: string;
    issuerName: string;
}
export default class IssuerModel {
    private issuer: IIssuer;

    constructor(private store: AppStore, issuer: IIssuer) {
        makeAutoObservable(this);
        this.issuer = issuer;
    }

    get asJson(): IIssuer {
        return toJS(this.issuer);
    }
}