import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export interface IHashCode {
    id: string;
    hashCode: string | null;
}

export default class HashCodeModel {
    private code: IHashCode;
    constructor(private store: AppStore, code: IHashCode) {
        makeAutoObservable(this);
        this.code = code;
    }
    get asJson(): IHashCode {
        return toJS(this.code);
    }
}

