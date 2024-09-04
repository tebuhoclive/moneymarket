import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import DocFoxApplicationsModel, { IDocFoxApplications } from "../models/clients/DocFoxApplicationsModel";

export default class DocFoxApplicationsStore extends Store<IDocFoxApplications, DocFoxApplicationsModel> {
    items = new Map<string, DocFoxApplicationsModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxApplications[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxApplicationsModel(this.store, item))
            );
        });
    }
}
