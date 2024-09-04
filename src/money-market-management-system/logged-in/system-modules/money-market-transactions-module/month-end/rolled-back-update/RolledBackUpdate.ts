import AppApi from "../../../../../../shared/apis/AppApi";
import AppStore from "../../../../../../shared/stores/AppStore";

export async function UpdateRolledBackBalance(api: AppApi, store: AppStore, accountId: string) {
    const currentMonthEnd = store.monthEndRun.all.find((m) => m.asJson.status === "Pending")?.asJson;
    if (currentMonthEnd) {
        const rollecdBackAccounts = currentMonthEnd.rolledBackAccounts.length;
        if (rollecdBackAccounts > 0) {
            //get account
            const mmaNumber = store.mma.all.find((m) => m.asJson.id === accountId)?.asJson.accountNumber;
            //update interest here
            try {
            } catch (error) {

            }
            finally {
                const mmaBalance = store.mma.all.find((m) => m.asJson.id === accountId)?.asJson.balance;
                const mmaInterest = store.mma.all.find((m) => m.asJson.id === accountId)?.asJson.monthTotalInterest;
                try {
                    await api.monthEndRun.updateRollBackAccountBalance("2024monthEndRuns", currentMonthEnd, accountId, mmaBalance || 0, mmaInterest || 0)  //needs to change.
                } catch (error) {
                } finally {
                }
            }
        }
        else {
        }
    }
}

export function getAccountIdNeed(store: AppStore, accountNumber: string): string {
    const mmaId = store.mma.all.find((a) => a.asJson.accountNumber === accountNumber)?.asJson.id;
    if (mmaId) {
        return mmaId
    }
    return "";
}