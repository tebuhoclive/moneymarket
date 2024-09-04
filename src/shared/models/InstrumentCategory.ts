import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultCategory: IInstrumentCategory = {
    id: "",
    categoryName: "",
    description: "",
}

export interface IInstrumentCategory {
    id: string;
    categoryName: string;
    description: string;
}
export default class InstrumentCategory {
    private category: IInstrumentCategory;

    constructor(private store: AppStore, category: IInstrumentCategory) {
        makeAutoObservable(this);
        this.category = category;
    }

    get asJson(): IInstrumentCategory {
        return toJS(this.category);
    }
}
