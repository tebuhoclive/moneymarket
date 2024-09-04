import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import NaturalPersonModel, { INaturalPerson } from "../models/clients/NaturalPersonModel";

export default class NaturalPersonStore extends Store<INaturalPerson, NaturalPersonModel> {
    items = new Map<string, NaturalPersonModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: INaturalPerson[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new NaturalPersonModel(this.store, item))
            );
        });
    }
}