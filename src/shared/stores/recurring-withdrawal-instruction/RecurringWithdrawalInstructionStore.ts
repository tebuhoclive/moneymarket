import { runInAction } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import RecurringWithdrawalInstructionModel, { IRecurringWithdrawalInstruction } from "../../models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";

export default class RecurringWithdrawalInstructionStore extends Store<IRecurringWithdrawalInstruction, RecurringWithdrawalInstructionModel> {
    items = new Map<string, RecurringWithdrawalInstructionModel>();

    constructor(store: AppStore) {
        super(store);
        this.store = store;
    }

    load(items: IRecurringWithdrawalInstruction[] = []) {
        runInAction(() => {
            items.forEach((item) =>
                this.items.set(item.id, new RecurringWithdrawalInstructionModel(this.store, item))
            );
        });
    }
}