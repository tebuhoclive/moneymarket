import AppApi from "../../../../shared/apis/AppApi";
import { IEarlyDistributionAccount } from "../../../../shared/models/EarlyDistributionAccountModel";

export async function createEarlyDistribution(api: AppApi, accountName: string, productId: string) {
    const accountData: IEarlyDistributionAccount = {
        id: "",
        productCode: productId,
        accountName: accountName,
        openingBalance: 0,
        balance: 100000,
        closingBalance: 0,
        isApproved: false
    }

    try {
        await api.earlyDistribution.create(accountData);
    } catch (error) {
    }
}