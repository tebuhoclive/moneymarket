import { runInAction } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import StatementTrackerModel, { IStatementTracker } from "../../models/statements-tracker/StatementTrackerModel";


export default class StatementTrackerStore extends Store<IStatementTracker, StatementTrackerModel> {
    items = new Map<string, StatementTrackerModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IStatementTracker[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new StatementTrackerModel(this.store, item))
            );
        });
    }
}