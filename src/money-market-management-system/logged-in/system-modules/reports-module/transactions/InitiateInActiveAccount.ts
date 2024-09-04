import AppApi from "../../../../../shared/apis/AppApi";
import AppStore from "../../../../../shared/stores/AppStore";

export async function initiateInActiveAccount(api: AppApi, store: AppStore, accountNumber: string, productCode: string, interestAmount: number, cid: string) {

    //get mma
    const mmaccount = store.mma.all.find((a) => a.asJson.accountNumber === accountNumber)?.asJson;

    //get early distro
    const edaccount = store.earlyDistribution.all.find((a) => a.asJson.productCode === productCode)?.asJson;


    const closeOut = store.closeOutStore.all.find((c) => c.asJson.id === cid)?.asJson;
    

    //In-Active mma
    // if (mmaccount) {
    //     try {
    //         await api.mma.updateApprovalStatus(mmaccount);
    //     } catch (error) {
    //     }
    // }

    //minus balance
    if (edaccount) {
        try {
            await api.earlyDistribution.updateAddBalance(edaccount, interestAmount);

        } catch (error) {

        }
    }

    if (closeOut) {
        try {
            await api.closeOutApi.updateMarkDone(closeOut);
        } catch (error) {
        }
    }
}
