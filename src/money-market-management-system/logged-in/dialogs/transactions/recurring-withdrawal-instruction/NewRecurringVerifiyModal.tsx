// import swal from "sweetalert";

// import MODAL_NAMES from "../../ModalName";
// import { useState, FormEvent, useEffect, SetStateAction } from "react";

// import NumberInput from "../../../shared/components/number-input/NumberInput";
// import { observer } from "mobx-react-lite";
// import DaySelector from "../../../../../shared/components/day-selector/DaySelector";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
// import { splitAndTrimString } from "../../../../../shared/functions/StringFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { IWithdrawalTransaction, defaultWithdrawalTransaction } from "../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson, defaultNaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { IRecurringWithdrawalInstruction, defaultRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";

// interface ITransactionInstructionsProps {
//   client: INaturalPerson | undefined;
//   withdrawal: IRecurringWithdrawalInstruction | undefined;
// }

// const NewRecurringVerifyWithdrawalModal = observer(
//   (props: ITransactionInstructionsProps) => {
//     const { api, store } = useAppContext();
//     const { client,withdrawal } = props;

//     const [loading, setLoading] = useState(false);
//     const [clientWithdrawal, setClientWithdrawal] =
//       useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
//     const [selectedClientAccount, setSelectedClientAccount] =
//       useState<IMoneyMarketAccount>();

//     const [selectedClient, setSelectedClient] = useState<
//       INaturalPerson | ILegalEntity
//     >();
//     const [selectedWithdrawal, setSelectedWithdrawal] = useState<
//     IRecurringWithdrawalInstruction | undefined
//   >();
//     const [recurringWithdrawal, setRecurringWithdrawal] =
//       useState<IRecurringWithdrawalInstruction>({
//         ...defaultRecurringWithdrawalInstruction,
//       });
//     const [instructionFileURL, setInstructionFileURL] = useState("");
//     const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
//     const timeCreated = Date.now();
//     const formattedCreated = new Date(timeCreated).toUTCString();
//     const [searchType, setSearchType] = useState("Account Number");
//     const auditTrail = store.withdrawalTransactionAudit.all;

//     const withdrawalTransactionAudit = auditTrail
//       .sort((a, b) => {
//         const dateA = new Date(a.asJson.auditDateTime || 0);
//         const dateB = new Date(b.asJson.auditDateTime || 0);

//         return dateB.getTime() - dateA.getTime();
//       })
//       .map((c) => {
//         return c.asJson;
//       });
//     const handleInstructionFileUpload = (url: string) => {
//       // Handle the URL in the parent component
//       setInstructionFileURL(url);
//     };

//     const handleReasonForNoAttachment = (reason: string) => {
//       // Handle the URL in the parent component
//       setReasonForNoAttachment(reason);
//     };
//     console.log("my recurring ",withdrawal);
    
//     const agents = store.agent.all;

//     const handleClientAccountChange = (accountNumber: string) => {
//       const selectedAccount = store.mma.all.find(
//         (mma) => mma.asJson.accountNumber === accountNumber
//       );
//       if (selectedAccount) {
//         store.mma.select(selectedAccount.asJson);
//         const account = store.mma.selected;
//         if (account) {
//           setClientWithdrawal({
//             ...clientWithdrawal,
//             allocation: account?.accountNumber,
//             bank: "",
//           });
//           setSelectedClientAccount(account);
//           return "";
//         }
//       }
//     };

//     const bankAccounts = selectedClient?.bankingDetail.map((acc) => ({
//       label: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//       value: `${acc.bankName} | ${acc.accountNumber} | ${acc.accountHolder} | ${acc.branchNumber}`,
//     }));

//     const agentsAccount = agents.map((acc) => ({
//       label: ` ${acc.asJson.agentName} - ${acc.asJson.bankName} (${acc.asJson.accountNumber}) `,
//       value: `${acc.asJson.bankName} | ${acc.asJson.agentName} | ${acc.asJson.accountNumber} | ${acc.asJson.branchCode}`,
//     }));

//     const clientBalance = () => {
//       const account = store.mma.all.find(
//         (mma) => mma.asJson.accountNumber === clientWithdrawal.allocation
//       );
//       return account ? account.asJson.balance - account.asJson.cession : 0;
//     };

//     const availableBalance = clientBalance() - clientWithdrawal.amount;

//     const handleUseAgentChange = () => {
//       setClientWithdrawal((prev) => ({
//         ...prev,
//         useAgent: !prev.useAgent,
//         bank: "",
//       }));
//     };

//     const handleDayChange = (selectedDay: string) => {
//       setRecurringWithdrawal({
//         ...recurringWithdrawal,
//         recurringDay: parseInt(selectedDay),
//       });
//     };

//     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//       if (selectedClient && selectedClientAccount) {
//         e.preventDefault();
//         const saveTransaction: IRecurringWithdrawalInstruction = {
//           id: "",
//           allocation: clientWithdrawal.allocation,
//           productCode: getMMAProduct(clientWithdrawal.allocation, store),
//           entity: selectedClient?.entityId,
//           amount: clientWithdrawal.amount,
//           bank: clientWithdrawal.bank,
//           reference: clientWithdrawal.reference || "IJG Payments",
//           email: clientWithdrawal.email || "",
//           description: clientWithdrawal.description,
//           valueDate: clientWithdrawal.valueDate || Date.now(),
//           transactionDate: Date.now(),
//           allocationStatus: "Awaiting Verification",
//           transactionStatus: "Pending",
//           transactionAction: "Loaded by User",
//           instruction: reasonForNoAttachment ? "" : instructionFileURL,
//           reasonForNoInstruction: instructionFileURL
//             ? ""
//             : reasonForNoAttachment,
//           recurringDay: clientWithdrawal.recurringDay,
//           timeCreated: formattedCreated,
//           useAgent: clientWithdrawal?.useAgent,
//         };

//         swal({
//           title: "Are you sure?",
//           icon: "warning",
//           buttons: ["Cancel", "Record"],
//           dangerMode: true,
//         }).then(async (edit) => {
//           if (edit) {
//             setLoading(true);
//             try {
//               await create(saveTransaction);
//               swal({
//                 icon: "success",
//                 text: `Transaction has been recorded, `,
//               });
//             } catch (error) {
//               console.log(error);
//             }
//             setLoading(false);
//             onCancel();
//           } else {
//             swal({
//               icon: "error",
//               text: "Transaction cancelled!",
//             });
//             setLoading(false);
//           }
//           setLoading(false);
//         });
//       }
//     };

//     const create = async (transaction: IRecurringWithdrawalInstruction) => {
//       try {
//         await api.recurringWithdrawalInstruction.create(transaction);
//         //   const email = MAIL_DEPOSIT_PROCESSED_NOTIFICATION(getClientName(clientWithdrawal, store), clientWithdrawal.bank, clientWithdrawal.amount)
//         //   await api.mail.sendMail(["maunda@ijg.net", 'ict@lotsinsigts.com'], "no-reply@ijgmms.net", "Processed Deposit Notification", email.BODY)
//         swal({
//           icon: "success",
//           text: "Transaction has been recorded",
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     const clientAccountOptionsAlt = store.mma.all.filter(
//       (mma) =>
//         mma.asJson.parentEntity === selectedClient?.entityId &&
//         mma.asJson.status === "Active"
//     );
//     const handleClientChange = (entityId: string) => {
//       const _selectedClient = clients.find(
//         (client) => client.asJson.entityId === entityId
//       );
//       if (_selectedClient) {
//         setSelectedClient(_selectedClient.asJson);
//         setSelectedClientAccount(undefined);
//       }
//     };

//     const clients = [...store.client.naturalPerson.all];

//     const clientOptions = clients
//       .sort((a, b) => {
//         const nameA = a.asJson.entityDisplayName;
//         const nameB = b.asJson.entityDisplayName;

//         return nameA.localeCompare(nameB);
//       })
//       .map((cli) => ({
//         label: `${cli.asJson.entityId} - ${cli.asJson.entityDisplayName}(${cli.asJson.oldCPNumber})`,
//         value: cli.asJson.entityId,
//       }));

//     const onCancel = () => {
//       store.recurringWithdrawalInstruction.clearSelected();
//       // store.recurringWithdrawalInstruction.clearSelected();

//       setInstructionFileURL("");
//       setReasonForNoAttachment("");
//       setSelectedClient({ ...defaultNaturalPerson });
//       setSelectedClientAccount(undefined);
//       setClientWithdrawal({ ...defaultWithdrawalTransaction });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.VERIFY_WITHDRAWAL_RECURRING_MODAL);
//     };

//     const clientAccountOptions = store.mma.all
//       .filter((mma) => mma.asJson.status === "Active")
//       .map((cli) => ({
//         label: cli.asJson.accountNumber,
//         value: cli.asJson.accountNumber,
//       }));
//     const handleChangeSearchType = (searchTYpe: string) => {
//       setSearchType(searchTYpe);
//       store.client.naturalPerson.clearSelected();
//       store.client.legalEntity.clearSelected();
//       store.mma.clearSelected();
//       setSelectedClient(undefined);
//       setSelectedClientAccount(undefined);
//       setClientWithdrawal({ ...defaultWithdrawalTransaction });
//     };
//     const onVerify = async () => {
//       if (withdrawal) {
//         swal({
//           title: "Are you sure?",
//           text: "Once verified, you cannot undo this action!",
//           icon: "warning",
//           buttons: ["Cancel", "Verify"],
//           dangerMode: true,
//         }).then(async (confirm) => {
//           if (confirm) {
//             try {
//               setLoading(true);
//               await api.recurringWithdrawalInstruction.updateRecurringWithdrawalStatus(withdrawal, "Verified");
//               setLoading(false);
//               swal("Success!", "Transaction has been verified.", "success");
//               // Handle further actions if necessary
//             } catch (error) {
//               setLoading(false);
//               console.error("Error:", error);
//               swal("Error!", "Failed to verify transaction.", "error");
//             }
//           } else {
//             swal("Cancelled", "Transaction verification cancelled.", "info");
//           }
//         });
//       }
//     };

//     const onAmend = async () => {
//       if (withdrawal) {
//         swal({
//           title: "Are you sure?",
//           text: "Once verified, you cannot undo this action!",
//           icon: "warning",
//           buttons: ["Cancel", "Verify"],
//           dangerMode: true,
//         }).then(async (confirm) => {
//           if (confirm) {
//             try {
//               setLoading(true);
//               await api.recurringWithdrawalInstruction.updateRecurringWithdrawalStatus(withdrawal, "Pending");
//               setLoading(false);
//               swal("Success!", "Transaction has been verified.", "success");
//               // Handle further actions if necessary
//             } catch (error) {
//               setLoading(false);
//               console.error("Error:", error);
//               swal("Error!", "Failed to verify transaction.", "error");
//             }
//           } else {
//             swal("Cancelled", "Transaction verification cancelled.", "info");
//           }
//         });
//       }
//     };

//     return (
//       <ErrorBoundary>
//         <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-3-4">
//           <button
//             className="uk-modal-close-default"
//             onClick={onCancel}
//             disabled={loading}
//             type="button"
//             data-uk-close
//           ></button>
//           <h3 className="main-title-sm text-to-break">
//             Load Recurring Withdrawal Instruction
//           </h3>
//           <hr />
//           <div className="uk-grid uk-grid-column">
//           <div className="uk-width-1-3">
//             {
//               selectedClient &&
//               <div className="uk-width-1-1 uk-margin-medium-top">
//                 <h4>Selected Client Details</h4>
//                 <div className="uk-grid uk-grid-small" data-uk-grid>
//                   <div className="uk-width-1-3">
//                     <p>Client Name:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{selectedClient.entityDisplayName}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Balance:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{(selectedClientAccount?.balance || 0)}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Remaining Balance:</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p className={`${availableBalance < 0 ? "text-danger uk-text-bold" : ""}`}>
//                       {
//                         !selectedClientAccount && 'Select Account'
//                       }
//                       {
//                         selectedClientAccount && availableBalance > 5000 &&
//                         `${(availableBalance)}`
//                       }
//                       {
//                         selectedClientAccount && availableBalance < 5000 &&
//                         `Funds cannot be withdrawn: Insufficient funds`
//                       }

//                     </p>
//                   </div>
//                   <hr className="uk-width-1-1" />
//                 </div>
//               </div>
//             }
//             {
//               clientWithdrawal.bank &&
//               <div className="uk-width-1-1 uk-margin-large-top">
//                 <h4>Selected Bank Account Details</h4>
//                 <div className="uk-grid uk-grid-small" data-uk-grid>
//                   <div className="uk-width-1-3">
//                     <p>Bank Name</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString('|', clientWithdrawal.bank)[0]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Account Name</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString('|', clientWithdrawal.bank)[2]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Account No.</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString('|', clientWithdrawal.bank)[1]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />

//                   <div className="uk-width-1-3">
//                     <p>Branch No.</p>
//                   </div>
//                   <div className="uk-width-2-3">
//                     <p>{splitAndTrimString('|', clientWithdrawal.bank)[3]}</p>
//                   </div>
//                   <hr className="uk-width-1-1" />
//                 </div>
//               </div>
//             }
//           </div>

//           <div className="dialog-content uk-position-relative uk-width-2-3">
//             <h4>Recurring Withdrawal Form</h4>
//             <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>
//             <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Search Type
//                 </label>
//                 <select
//                   className="uk-select uk-form-small"
//                   defaultValue={searchType}
//                   id="clientAccount"
//                   name={"clientAccount"}
//                   onChange={(e) => handleChangeSearchType(e.target.value)}

//                 // required
//                 >
//                   <option value="">Select search type...</option>
//                   {/* <option value="Account Number">Account Number</option> */}
//                   <option value="Client Name">Client Name</option>


//                 </select>
//               </div>
//               {
//                 searchType === 'Client Name' &&
//                 <div className="uk-width-1-2">
//                   <div className="uk-grid uk-grid-small">
//                     <div className="uk-form-controls uk-width-2-3">
//                       <label className="uk-form-label required" htmlFor="">
//                         Client Name
//                       </label>
//                       <SingleSelect
//                         options={clientOptions}
//                         name="selectedClient?.entityId"
//                         value={selectedClient?.entityId}
//                         onChange={(value) => handleClientChange(value)}
//                         placeholder="e.g Client Name"
//                         required
//                       />
//                     </div>
//                     <div className="uk-form-controls uk-width-1-3">
//                       <label className="uk-form-label required" htmlFor="">
//                         Money Market Account
//                       </label>
//                       <select
//                         className="uk-select uk-form-small"
//                         defaultValue={"Select Account"}
//                         id="clientAccount"
//                         name={"clientAccount"}
//                         onChange={(e) => handleClientAccountChange(e.target.value)}
//                         required
//                       >
//                         <option value={""}>
//                           Select...
//                         </option>
//                         {clientAccountOptionsAlt.map((acc) => (
//                           <option key={acc.asJson.id} value={acc.asJson.accountNumber}>
//                             {acc.asJson.accountNumber}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               }

//               {
//                 searchType === 'Account Number' &&

//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     Search Money Market Account
//                   </label>
//                   <SingleSelect
//                     options={clientAccountOptions}
//                     name="selectedClient?.entityId"
//                     value={selectedClientAccount?.accountNumber}
//                     onChange={(value) => handleClientAccountChange(value)}
//                     placeholder="e.g Client Name"
//                     required
//                   />
//                 </div>
//               }
//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Recurring Day
//                 </label>
//                 <DaySelector onChange={handleDayChange} />
//               </div>
//               {
//                 selectedClient &&
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label
//                     className={`uk-form-label uk-display-block`}
//                   >
//                     Do you wish to make the payment to an Agent?
//                     <input
//                       className="uk-checkbox"
//                       type="checkbox"
//                       checked={clientWithdrawal.useAgent}
//                       onChange={handleUseAgentChange}
//                       style={{ marginLeft: '10px' }}
//                     />
//                   </label>
//                 </div>
//               }
//               {
//                 selectedClient && !clientWithdrawal.useAgent && bankAccounts &&
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="clientAccount">
//                     Client Bank Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={clientWithdrawal.bank}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={(e) =>
//                       setClientWithdrawal({
//                         ...clientWithdrawal,
//                         bank: e.target.value,
//                       })
//                     }
//                     required
//                   >
//                     <option value="">
//                       Select...
//                     </option>
//                     {bankAccounts.map((acc: any) => (
//                       <option key={acc.value} value={acc.value}>
//                         {acc.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               }
//               {
//                 selectedClient && clientWithdrawal.useAgent && agentsAccount &&
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     Agent Bank Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={clientWithdrawal.bank}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={(e) =>
//                       setClientWithdrawal({
//                         ...clientWithdrawal,
//                         bank: e.target.value,
//                       })
//                     }
//                     required
//                   >
//                     <option value="">
//                       Select agent...
//                     </option>
//                     {agentsAccount.map((acc) => (
//                       <option key={acc.value} value={acc.value}>
//                         {acc.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               }
//               {
//                 (selectedClient && clientWithdrawal.useAgent && !bankAccounts) || (selectedClient?.entityId && !clientWithdrawal.useAgent && !agentsAccount) ? (
//                   <div className="uk-width-1-2">
//                     No Bank account(s) have been loaded for {clientWithdrawal.useAgent ? 'selected agent' : 'selected client'}
//                   </div>
//                 ) : (
//                   <></>
//                 )
//               }

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Amount
//                 </label>
//                 <NumberInput
//                   id="amount"
//                   className="auto-save uk-input purchase-input uk-form-small"
//                   placeholder="-"
//                   value={clientWithdrawal.amount}
//                   onChange={(value) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       amount: Number(value),
//                     })
//                   }
//                 />
//               </div>

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Bank Reference
//                 </label>
//                 { }
//                 <textarea
//                   className="uk-textarea uk-form-small"
//                   defaultValue="IJG Payments"
//                   rows={3}
//                   id="amount"
//                   maxLength={30}
//                   name={"amount"}
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       reference: e.target.value,
//                     })
//                   }
//                   required
//                 />
//               </div>
//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label" htmlFor="">
//                   Client Email
//                 </label>
//                 { }
//                 <input
//                   className="uk-textarea uk-form-small"
//                   defaultValue={selectedClient?.contactDetail.emailAddress}
//                   id="emailAddress"
//                   maxLength={30}
//                   name={"emailAddress"}
//                   onChange={(e) =>
//                     setClientWithdrawal({
//                       ...clientWithdrawal,
//                       email: e.target.value,
//                     })
//                   }
//                 />
//               </div>

//               <div className="uk-grid uk-grid-small uk-grid-match uk-child-width-1-1 uk-width-1-1">
//                 {clientWithdrawal.instruction}
//                 <div className="uk-width-1-2">
//                   <InstructionFileUploader
//                     onFileUpload={handleInstructionFileUpload}
//                     onProvideReason={handleReasonForNoAttachment}
//                     fileUrl={clientWithdrawal.instruction}
//                     reasonForNotProvingFile={
//                       clientWithdrawal.reasonForNoInstruction
//                     }
//                     label="Client Instruction"
//                     allocation={clientWithdrawal.allocation}
//                     onCancel={onCancel}
//                   />
//                 </div>
//               </div>

//               {
//                 !clientWithdrawal.bank &&
//                 <div className="uk-width-1-2"></div>
//               }
//               <hr className="uk-width-1-1" />
//               <div className="uk-form-controls uk-width-1-1">
//                 {availableBalance < 0 && (
//                   <span className="uk-text-danger uk-display-block">
//                     Insufficient funds
//                   </span>
//                 )}
//                 {selectedClient?.restricted && (
//                   <span className="uk-text-danger uk-display-block">
//                     Client has been restricted: {selectedClient.reasonForRestriction}
//                   </span>
//                 )}
//                 {(availableBalance < 0 || selectedClient?.restricted) &&
//                   <button type="submit" className="btn btn-primary" disabled>
//                     Record
//                   </button>
//                 }
//                 {availableBalance >= 0 && (
//                   <>
//                     <button
//                       type="submit"
//                       className="btn btn-primary"
//                       disabled={clientWithdrawal.amount === 0 || loading}
//                     >
//                       Record {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//                     </button>
//                   </>
//                 )}
//                 <button
//                   type="button"
//                   className="btn btn-danger"
//                   onClick={onCancel}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>

//           </div>
//         </div>
//           <div style={{ marginTop: "10px" }}>
//             <button className="btn btn-primary" onClick={onAmend}>Return For Amend</button>
//             <span style={{ margin: "0 5px" }}></span>
//             <button className="btn btn-primary" onClick={onVerify}>Verify</button>
//             <span style={{ margin: "0 5px" }}></span>
//             <button className="btn btn-danger" onClick={onCancel}>Close</button>
//           </div>
//         </div>
//       </ErrorBoundary>
//     );
//   })

// export default NewRecurringVerifyWithdrawalModal;

import React from 'react'

const NewRecurringVerifiyModal = () => {
  return (
    <div>
      
    </div>
  )
}

export default NewRecurringVerifiyModal
