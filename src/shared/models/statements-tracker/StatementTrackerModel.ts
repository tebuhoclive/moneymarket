import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export interface IStatementTracker {
    id: string;
    trackerCode: string | null;
}

export default class StatementTrackerModel {
    private code: IStatementTracker;
    constructor(private store: AppStore, code: IStatementTracker) {
        makeAutoObservable(this);
        this.code = code;
    }
    get asJson(): IStatementTracker {
        return toJS(this.code);
    }
}

