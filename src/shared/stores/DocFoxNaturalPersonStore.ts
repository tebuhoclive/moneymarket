import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import DocFoxNaturalPersonModel, { IDocFoxNaturalPerson } from "../models/clients/DocFoxNaturalPersonModel";

export default class DocFoxNaturalPersonStore extends Store<IDocFoxNaturalPerson, DocFoxNaturalPersonModel> {
    items = new Map<string, DocFoxNaturalPersonModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IDocFoxNaturalPerson[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new DocFoxNaturalPersonModel(this.store, item))
            );
        });
    }
}
