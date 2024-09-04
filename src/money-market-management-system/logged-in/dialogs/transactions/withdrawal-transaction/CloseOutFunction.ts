// import AppApi from "../../../../../shared/apis/AppApi";
// import { ISwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
// import { ICloseOutDistribution } from "../../../../../shared/models/close-outs/CloseOutModel";
// import AppStore from "../../../../../shared/stores/AppStore";

// export async function createCloseOffRecord(api: AppApi, transactionId: string, amount: number, accountNumber: string, _entity: string, _currentBalance: number, _capitalisedAmount: number, _lastRate: number, _bank: string, _instruction: string, _reason: string) {
//     const closeOffRecord: ICloseOutDistribution = {
//         id: "",
//         closeOffDate: Date.now(),
//         accountNumber: accountNumber,
//         entity: _entity,
//         currentBalance: _currentBalance,
//         capitalisedAmount: _capitalisedAmount,
//         lastRate: _lastRate,
//         closeOutAmount: amount,
//         bank: _bank,
//         agency: "",
//         instruction: _instruction,
//         reasonForNoInstruction: _reason,
//         isPaymentProcessed: false,
//         transactionId: transactionId,
//         processedDate: 0
//     }

//     try {
//         await api.closeOutApi.create(closeOffRecord);
//     } catch (error) {
//     }
// }

// export async function createCloseOffSwitchRecord(api: AppApi, store: AppStore, transaction: ISwitchTransaction, entityNumber: string, _currentBalance: number, _capitalisedAmount: number, _lastRate: number) {
//     const closeOffRecord: ICloseOutDistribution = {
//         id: "",
//         closeOffDate: Date.now(),
//         accountNumber: transaction.fromAccount,
//         entity: entityNumber,
//         currentBalance: _currentBalance,
//         capitalisedAmount: _capitalisedAmount,
//         lastRate: _lastRate,
//         closeOutAmount: transaction.amount,
//         bank: "",
//         agency: "",
//         instruction: "",
//         reasonForNoInstruction: "",
//         isPaymentProcessed: false,
//         transactionId: transaction.id,
//         processedDate: 0
//     }

//     try {
//         await api.closeOutApi.create(closeOffRecord);
//     } catch (error) {
//     }
// }

const CloseOutFunction = () => {
  return ("")
}

export default CloseOutFunction
