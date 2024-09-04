import AppApi from "../../../../../../../shared/apis/AppApi";
import AppStore from "../../../../../../../shared/stores/AppStore";

export async function withdrawFromEarlyDistribution(api: AppApi, store: AppStore, productCode: string, tid: string, amount: number) {
    const account = store.earlyDistribution.all.find((a) => a.asJson.productCode === productCode)?.asJson;
    const closeOut = store.closeOutStore.all.find((c) => c.asJson.transactionId === tid)?.asJson;

    if (account && closeOut) {
        try {
            await api.earlyDistribution.updateMinusBalance(account, amount);
            await api.closeOutApi.updateApprovalStatus(closeOut);
        } catch (error) {
        }
    }
}