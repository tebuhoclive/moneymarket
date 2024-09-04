// import swal from "sweetalert";
// import { observer } from "mobx-react-lite";
// import { useEffect, useState } from "react";
// import { useAppContext } from "../../../../../../shared/functions/Context";
// import {
//   IWithdrawalTransaction,
//   defaultWithdrawalTransaction,
// } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
// import { cancelWithdrawalTransaction } from "../../../../../../shared/functions/MyFunctions";
// import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
// import MODAL_NAMES from "../../../../dialogs/ModalName";


// interface IProps {
//   setVisible: (show: boolean) => void;
// }

// export const CancelTransactionModal = observer(({ setVisible }: IProps) => {
//   const { store, api } = useAppContext();
//   const [comment, setComment] = useState("");
//   const [transaction, setTransaction] = useState<IWithdrawalTransaction>({
//     ...defaultWithdrawalTransaction,
//   });
//   const [loading, setLoading] = useState(false);

//   const cancelTransaaction = async () => {
//     if (comment !== "") {
//       swal({
//         title: "Are you sure?",
//         text: "You are about to revert this transaction",
//         icon: "warning",
//         buttons: ["Cancel", "Proceed"],
//         dangerMode: true,
//       }).then(async (edit) => {
//         if (edit) {
//           try {
//             setLoading(true);
//             await cancelWithdrawalTransaction(
//               store,
//               api,
//               "From Authorised Tab",
//               transaction.id || "",
//               comment
//             );
//           } catch (error) {
//             console.log(error);
//           } finally {

//             setLoading(false);
//             hideModalFromId(MODAL_NAMES.ADMIN.CANCEL_TRANSACTION_MODAL);
//           }
//         } else {
//           swal({
//             icon: "error",
//             text: "Transaction transaction reverted successfully!",
//           });
//         }
//       });
//     } else {

//     }
//   };


//   const onCancel = () => {
//     setVisible(false);
//   }

//   useEffect(() => {
//     if (store.withdrawalTransaction.selected) {
//       setTransaction(store.withdrawalTransaction.selected);
//     }
//   }, [store.withdrawalTransaction.selected]);

//   return (
//     <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2">
//       <button
//         className="uk-modal-close-default"
//         // disabled={loading}
//         onClick={onCancel}
//         type="button"
//         data-uk-close
//       ></button>
//       <div className="uk-margin">
//         <h3 className="main-title-sm text-to-break">Transaction Details</h3>
//         <p className="main-title-sm text-to-break">
//           Transaction Date:{" "}
//           {dateFormat_YY_MM_DD_NEW(transaction.transactionDate)} <br />
//           Value Date: {dateFormat_YY_MM_DD_NEW(transaction.valueDate)} <br />
//           reference: {transaction.reference} <br />
//           description: {transaction.description} <br />
//           Amount: {(transaction.amount)} <br />
//         </p>
//       </div>
//       <div className="uk-margin">
//         <hr />
//       </div>
//       <div className="uk-margin">
//         <div className="uk-margin">
//           <label>
//             <p
//               className="main-title-sm text-to-break"
//               style={{ fontSize: "12px" }}
//             >
//               Reason For cancelling transaction
//             </p>
//           </label>
//         </div>
//         <div>
//           <textarea
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="uk-input"
//             placeholder="Comment..."
//           />
//         </div>
//       </div>
//       <div className="uk-margin">
//         <hr />
//       </div>
//       <div className="uk-margin">
//         <button
//           className="btn btn-primary"
//           disabled={loading}
//           onClick={cancelTransaaction}
//         >
//           Start Cancellation{" "}
//           {loading && <div data-uk-spinner={"ratio: .5"}></div>}
//         </button>
//       </div>
//     </div>
//   );
// });


import React from 'react'

const CancelTransactionModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default CancelTransactionModal
