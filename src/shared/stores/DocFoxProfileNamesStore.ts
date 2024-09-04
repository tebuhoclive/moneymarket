import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import DocFoxProfileNamesModel, { IDocFoxProfile } from "../models/clients/DocFoxProfileNamesModel";

export default class DocFoxProfileNamesStore extends Store<IDocFoxProfile, DocFoxProfileNamesModel> {
    items = new Map<string, DocFoxProfileNamesModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxProfile[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxProfileNamesModel(this.store, item))
            );
        });
    }
}
