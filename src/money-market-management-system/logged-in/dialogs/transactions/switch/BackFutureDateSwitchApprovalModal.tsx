import { useEffect, useState } from "react";
// import MODAL_NAMES from "../../ModalName";

// import { observer } from "mobx-react-lite";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { VerifyUploadComponent } from "../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { currencyFormat } from "../../../../../shared/functions/Directives";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { ISwitchTransaction, defaultSwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
// import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";

// const ViewSwitchModal = observer(() => {
//   const { api, store } = useAppContext();

//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingApproval, setLoadingApproval] = useState<boolean>(false);
//   const [returnForAmendment, setReturnForAmendment] = useState(false);

//   const [switchTransaction, setSwitchTransaction] =
//     useState<ISwitchTransaction>({ ...defaultSwitchTransaction });

//   const auditTrail = store.switchAudit.all;

//   const moneyMarketAccounts = store.mma.all;

//   const fromAccount = moneyMarketAccounts.find(
//     (account) => account.asJson.accountNumber === switchTransaction.fromAccount
//   );

//   const toAccount = moneyMarketAccounts.find(
//     (account) => account.asJson.accountNumber === switchTransaction.toAccount
//   );

//   const toAccountDetails: IDataDisplay[] = [
//     {
//       label: "Date",
//       value: dateFormat_YY_MM_DD(switchTransaction.switchDate)
//     },
//     {
//       label: "Account Name",
//       value: toAccount ? toAccount.asJson.accountName : ""
//     },
//     {
//       label: "Account Number",
//       value: toAccount ? toAccount.asJson.accountNumber : ""
//     },
//     {
//       label: "Balance",
//       value: toAccount ? toAccount.asJson.accountNumber : ""
//     },
//   ]

//   const switchAudit = auditTrail
//     .sort((a, b) => {
//       const dateA = new Date(a.asJson.auditDateTime || 0);
//       const dateB = new Date(b.asJson.auditDateTime || 0);

//       return dateB.getTime() - dateA.getTime();
//     })
//     .map((c) => {
//       return c.asJson;
//     });

//   const onCancel = () => {
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ACCOUNTS_MODAL);
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (store.switch.selected) {
//       setSwitchTransaction(store.switch.selected);
//     }
//   }, [store.switch.selected]);

//   useEffect(() => {
//     const loadData = () => {
//       return new Promise(async (resolve, reject) => {
//         try {
//           setLoading(true);
//           if (switchTransaction && switchTransaction.id) {
//             await api.switchAudit.getAll(switchTransaction.id);
//             if (toAccount) {
//               await api.statementTransaction.getAll(toAccount.asJson.id);
//             }
//             if (fromAccount) {
//               await api.statementTransaction.getAll(fromAccount.asJson.id);
//             }
//           }
//           setLoading(false);
//         } catch (error) {
//           reject(error);
//         }
//       });
//     };

//     loadData();
//   }, [api.switchAudit, switchTransaction, api.statementTransaction, toAccount, fromAccount]);

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
//         <button className="uk-modal-close-default" onClick={onCancel} type="button" data-uk-close></button>
//         <h3 className="main-title-lg text-to-break">Switch Transaction</h3>
//         <hr />
//         <div className="uk-grid" data-uk-grid>
//           <div className="dialog-content uk-position-relative uk-width-1-3">
//             <h4 className="main-title-sm">Switch Transaction Details</h4>
//             <div className="uk-grid uk-grid-small" data-uk-grid>
//               <div className="uk-width-1-3">
//                 <p>Transaction Date</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>
//                   {dateFormat_YY_MM_DD(
//                     switchTransaction?.switchDate || Date.now()
//                   )}
//                 </p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>From Account</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{switchTransaction?.fromAccount}</p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>To Account</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{switchTransaction?.toAccount}</p>
//               </div>
//               <div className="uk-width-1-3">
//                 <p>Amount</p>
//               </div>
//               <div className="uk-width-2-3">
//                 <p>{currencyFormat(switchTransaction?.amount || 0)}</p>
//               </div>
//             </div>
//             <div className="uk-grid uk-grid-small uk-width-1-1">
//               {fromAccount && (
//                 <>
//                   <div className="uk-grid uk-grid-small" data-uk-grid>
//                     <h4 className="main-title-sm">Switch-From Account Information</h4>
//                     <div className="uk-width-1-3">
//                       <p>Account Number</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.accountNumber}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Account Name</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.accountName}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Product Code</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.accountType}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Fee Rate</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>{fromAccount.asJson.feeRate}</p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Cession</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {currencyFormat(fromAccount.asJson.cession)}
//                       </p>
//                     </div>

//                     <div className="uk-width-1-3">
//                       <p>Balance</p>
//                     </div>
//                     <div className="uk-width-2-3">
//                       <p>
//                         {currencyFormat(fromAccount.asJson.balance)}
//                       </p>
//                     </div>
//                   </div>
//                 </>
//               )}
//               {toAccount && (
//                 <>
//                   <h4 className="main-title-sm uk-margin-top uk-margin-bottom">Switch-To Account Information</h4>
//                   <DetailView dataToDisplay={toAccountDetails} />
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="uk-width-2-3">
//             <h4 className="main-title-sm">
//               Transaction Audit Trail
//             </h4>

//             {loading && <LoadingEllipsis />}
//             <div className="uk-grid uk-grid-small" data-uk-grid>
//               <div className="uk-width-1-2">
//                 <VerifyUploadComponent
//                   onFileUpload={(fileUrl) => {
//                     // Update switchTransaction or perform other actions with fileUrl
//                     setSwitchTransaction((prev) => ({
//                       ...prev,
//                       instruction: fileUrl || "",
//                     }));
//                   }}
//                   onProvideReason={(reason) => {
//                     // Update switchTransaction or perform other actions with reason
//                     setSwitchTransaction((prev) => ({
//                       ...prev,
//                       reasonForNoInstruction: reason || "",
//                     }));
//                   }}
//                   fileUrl={switchTransaction?.instruction || ""}
//                   reasonForNotProvingFile={
//                     switchTransaction?.reasonForNoInstruction || ""
//                   }
//                   label="Client Instruction"
//                   allocation={switchTransaction?.fromAccount}
//                 />
//               </div>
//               <div className="uk-width-1-2">
//                 {switchTransaction?.returnNote && (
//                   <div className="uk-form-controls">
//                     <label className="uk-form-label">Return Note</label>
//                     <textarea className="uk-textarea uk-form-small" disabled>
//                       {switchTransaction?.returnNote}
//                     </textarea>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <hr />
//             <div className="uk-grid uk-grid-small" data-uk-grid>
//               <button type="button" className="btn btn-primary" disabled={returnForAmendment}>Return for Amendment{returnForAmendment && (
//                 <div data-uk-spinner={"ratio:.5"}></div>
//               )}
//               </button>

//               <button
//                 className="btn btn-primary" disabled={loadingApproval}>
//                 Approve and Complete
//                 {
//                   loadingApproval && <div data-uk-spinner={"ratio:.5"}></div>
//                 }
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default ViewSwitchModal;
