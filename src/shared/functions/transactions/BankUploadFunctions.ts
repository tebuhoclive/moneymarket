import swal from "sweetalert";
import AppStore from "../../stores/AppStore";
import { IDepositTransaction } from "../../models/deposit-transaction/DepositTransactionModel";
import AppApi from "../../apis/AppApi";
import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
import showModalFromId, { hideModalFromId } from "../ModalShow";

export const onHandleFirstTransactionVerification = (
  transactionId: string,
  store: AppStore
) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction) {
    store.depositTransaction.select(selectedTransaction.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_APPROVE_FIRST_LEVEL_MODAL);
  }
};

export const onHandleSecondTransactionVerification = (
  transactionId: string,
  store: AppStore
) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction) {
    store.depositTransaction.select(selectedTransaction.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_APPROVE_SECOND_LEVEL_MODAL);
  }
};

export const onViewTransaction = (transactionId: string, store: AppStore) => {
  console.log("🚀 ~ onViewTransaction ~ transactionId:", transactionId);
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction?.asJson) {
    console.log(
      "🚀 ~ onViewTransaction ~ selectedTransaction:",
      selectedTransaction
    );
  }
};
export const onEditTransaction = (transactionId: string, store: AppStore) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction) {
    store.depositTransaction.select(selectedTransaction.asJson);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL
    );
  }
};

// export const onViewTransactionBackDated = (
//   transactionId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.depositTransaction.getItemById(
//     transactionId
//   );
//   if (selectedTransaction) {
//     store.depositTransaction.select(selectedTransaction.asJson);
//     showModalFromId(
//       MODAL_NAMES.BACK_OFFICE.DEPOSIT_BACK_FUTURE_DATING_APPROVAL_MODAL
//     );
//   }
// };

// export const onReturnTransaction = (transactionId: string, store: AppStore) => {
//   const selectedTransaction = store.depositTransaction.getItemById(
//     transactionId
//   );

//   if (selectedTransaction) {
//     store.depositTransaction.select(selectedTransaction.asJson);
//     showModalFromId(
//       MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_TRANSACTION_MODAL
//     );
//   } else {
//   }
// };

// export const onMarkTransactionAsNonDeposit = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been marked as a Non Deposit Transaction",
//       });
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL
//       );

//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Mark as Non-Deposit"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Non-Deposit",
//           createdAtTime: { nonDepositsQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onMarkTransactionAsUnallocated = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been moved Unallocated Transactions",
//       });
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Move to Unallocated"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         // Check if setLoader is defined
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );
//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Unallocated",
//           createdAtTime: { unAllocatedQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           // Check if setLoader is defined
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Re-allocation cancelled!",
//       });
//     }
//   });
// };

// export const onRestoreDeletedTransaction = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Restore"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );
//       console.log("🚀 ~ oldTransaction:", oldTransaction)

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Non-Deposit",
//           createdAtTime: { nonDepositsQueue: Date.now() },
//           // description: "Restored from Deleted Queue",
//         };

//         try {
//           // await api.depositTransaction.update(saveTransaction);
//         } catch (error) { }

//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Restoring transaction cancelled!",
//       });
//     }
//   });
// };

// export const onDeleteTransaction = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been deleted",
//       });
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Delete"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Deleted",
//           createdAtTime: { deletedQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onNonDeleteTransaction = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been deleted",
//       });
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Delete"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Deleted",
//           createdAtTime: { deletedQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onRestoreNonTransaction = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been restored",
//       });

//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_QUEUED_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Restore"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           transactionStatus: "Draft",
//           createdAtTime: { transactionQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onNonDeleteTransactionNew = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoader?: (loading: boolean) => void
// ) => {
//   const update = async (
//     oldTransactionState: IDepositTransaction,
//     newTransactionState: IDepositTransaction
//   ) => {
//     try {
//       await api.depositTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been deleted",
//       });
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_BACK_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_FUTURE_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_AUTO_TRANSACTION_MODAL
//       );
//       hideModalFromId(
//         MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
//       );
//     } catch (error) { }
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Delete"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       const oldTransaction = store.depositTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.depositTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IDepositTransaction = {
//           ...oldTransaction.asJson,
//           createdAtTime: { deletedQueue: Date.now() },
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//         if (setLoader) {
//           setLoader(false);
//         }
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };
