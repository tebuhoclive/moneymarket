import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import DocFoxApplicationRiskRatingsModel, { IDocFoxApplicationRiskRatings } from "../models/clients/DocFoxApplicationRiskRatingModel";


export default class DocFoxApplicationRiskRatingsStore extends Store<IDocFoxApplicationRiskRatings, DocFoxApplicationRiskRatingsModel> {
    items = new Map<string, DocFoxApplicationRiskRatingsModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxApplicationRiskRatings[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxApplicationRiskRatingsModel(this.store, item))
            );
        });
    }
}
