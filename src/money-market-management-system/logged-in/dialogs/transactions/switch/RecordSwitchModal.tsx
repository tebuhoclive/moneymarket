import { FormEvent, useState } from "react";

// import MODAL_NAMES from "../../ModalName";
// import Select from "react-select";
// import { observer } from "mobx-react-lite";
// import React from "react";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { ISwitchTransaction, defaultSwitchTransaction } from '../../../../../shared/models/SwitchTransactionModel';
// import swal from "sweetalert";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import NumberInput from "../../../shared/components/number-input/NumberInput";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";

// const RecordSwitchModal = observer(() => {
//   const { api, store } = useAppContext();
//   const [clientName, setClientName] = useState("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingAccount, setLoadingAccount] = useState<boolean>(false);
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity | null
//   >();
//   const [chooseAccountNumber, setChooseAccountNumber] = useState(false);


//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];
//   const moneyMarketAccounts = store.mma.all;
//   const timeAuthorized = Date.now();
//   const formattedTime = new Date(timeAuthorized).toUTCString();

//   const [switchTransaction, setSwitchTransaction] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });


//   let fromAccount = moneyMarketAccounts.find(
//     (account) =>
//       account.asJson.accountNumber === switchTransaction?.fromAccount
//   );

//   let toAccount = moneyMarketAccounts.find(
//     (account) =>
//       account.asJson.accountNumber === switchTransaction.toAccount
//   );

//   const [instructionFileURL, setInstructionFileURL] = useState("");
//   const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");

//   const handleInstructionFileUpload = (url: string) => {
//     // Handle the URL in the parent component
//     setInstructionFileURL(url);
//   };

//   const handleReasonForNoAttachment = (reason: string) => {
//     // Handle the URL in the parent component
//     setReasonForNoAttachment(reason);
//   };

//   const [clientAccountOptions, setClientAccountOptions] = useState<IMoneyMarketAccount[]>([]);

//   const clientOptions = clients.map(cli => ({
//     label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//     value: cli.asJson.entityId,
//   })).sort((a, b) => {
//     const nameA = a.label;
//     const nameB = b.label;
//     return nameA.localeCompare(nameB);
//   });

//   const handleClientChange = (clientName: string) => {
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     setClientAccountOptions([]);
//     toAccount = undefined;
//     fromAccount = undefined;

//     setClientName(clientName);

//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === clientName
//     );

//     if (_selectedClient) {
//       setSelectedClient(_selectedClient.asJson);
//     }



//     const _clientAccountOptions = moneyMarketAccounts.filter(
//       (mma) => mma.asJson.parentEntity === clientName
//     ).map((mma) => { return mma.asJson });

//     if (_clientAccountOptions) {
//       setClientAccountOptions(_clientAccountOptions);
//     }
//   }

//   const handleFromAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setLoadingAccount(true);
//     toAccount = undefined;
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     const selectedValue = e.target.value;
//     if (selectedValue === switchTransaction.fromAccount) {
//       toAccount = undefined;
//       setSwitchTransaction({ ...defaultSwitchTransaction });
//     }

//     setSwitchTransaction({
//       ...switchTransaction,
//       fromAccount: selectedValue,
//       toAccount: ""
//     });
//     setLoadingAccount(false)
//   };

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

//   // const handleSwitchBetweenAccounts = (e: FormEvent<HTMLFormElement>) => {
//   //   e.preventDefault();
//   //   swal({
//   //     title: "Are you sure?",
//   //     icon: "warning",
//   //     buttons: ["Cancel", "Switch"],
//   //     dangerMode: true,
//   //   }).then(async (edit) => {
//   //     setLoading(true);
//   //     if (edit) {
//   //       const withDrawFromAccount = moneyMarketAccounts.find(
//   //         (account) =>
//   //           account.asJson.accountNumber ===
//   //           switchTransaction.fromAccount
//   //       );
//   //       const depositToAccount = moneyMarketAccounts.find(
//   //         (account) =>
//   //           account.asJson.accountNumber ===
//   //           switchTransaction.toAccount
//   //       );

//   //       if (depositToAccount && withDrawFromAccount) {
//   //         const _switchTransaction: ISwitchTransaction = {
//   //           id: "",
//   //           switchDate: Date.now(),
//   //           entity: clientName,
//   //           fromAccount: switchTransaction.fromAccount,
//   //           fromProductCode: getMMAProduct(switchTransaction.fromAccount, store),
//   //           toAccount: switchTransaction.toAccount,
//   //           toProductCode: getMMAProduct(switchTransaction.toAccount, store),
//   //           amount: switchTransaction.amount,
//   //           executionTime: formattedTime,
//   //           switchStatus: "Pending",
//   //           switchAction: "Recorded",
//   //           instruction: switchTransaction.instruction,
//   //           reasonForNoInstruction: switchTransaction.reasonForNoInstruction,
//   //           clientInstruction: {
//   //             url: switchTransaction.clientInstruction.url,
//   //             reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
//   //           }

//   //         };

//   //         try {
//   //           await api.switch.create(_switchTransaction);
//   //         } catch (error) {
//   //           console.log(error);
//   //         }
//   //       }

//   //       swal({
//   //         icon: "success",
//   //         text: "Switch recorded",
//   //       });
//   //       onCancel();
//   //     }
//   //   });
//   //   setLoading(false);
//   // };

//   const onCancel = () => {
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ACCOUNTS_MODAL);
//     setLoading(false);
//     setSelectedClient(null);
//     setReasonForNoAttachment("");
//     setInstructionFileURL("");
//   };

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           type="button"
//           data-uk-close
//         ></button>
//         <h3 className="main-title-sm text-to-break">
//           Switch Between Accounts
//         </h3>
//         <hr />
//         <div className="dialog-content uk-position-relative">
//           <form
//             className="uk-grid uk-grid-small"
//             data-uk-grid
//             // onSubmit={handleSwitchBetweenAccounts}
//           >

//             <div className="uk-margin">
//               <label>Account Number</label>
//               <input
//                 className="uk-checkbox"
//                 type="checkbox"
//                 checked={chooseAccountNumber}
//                 onChange={(e: any) => setChooseAccountNumber(e.target.value)}
//               />
//             </div>
//             {chooseAccountNumber === false ?

//               <div className="uk-form-controls uk-width-1-2">
//                 <label className="uk-form-label required" htmlFor="">
//                   Client Name
//                 </label>
//                 <Select
//                   id="clientSelect"
//                   options={clientOptions} // Cast to any to resolve the type error
//                   onChange={(selectedOption) => {
//                     if (selectedOption?.value) {
//                       // Check for entityId property
//                       handleClientChange(selectedOption.value);
//                     }
//                   }}
//                   value={
//                     selectedClient
//                       ? {
//                         label: selectedClient.entityDisplayName,
//                         value: selectedClient.entityId,
//                       }
//                       : null
//                   }
//                   placeholder="Select a client"
//                   isSearchable // This makes the Select component searchable
//                   filterOption={(option, searchText) => {
//                     if (!searchText) return true; // If search text is empty, show all options
//                     return option.label
//                       .toLowerCase()
//                       .trim()
//                       .startsWith(searchText.toLowerCase().trim());
//                   }}
//                 />
//               </div> :
//               <div className="uk-form-controls uk-width-1-2">
//                 <h1>CHOOSE ACCOUNT NUMBER</h1>
//               </div>
//             }
//             <div className="uk-width-1-2"></div>
//             {clientAccountOptions &&
//               <>
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     From Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={switchTransaction.fromAccount}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={handleFromAccountChange}
//                     required
//                   >
//                     <option value={""} disabled>
//                       Select...
//                     </option>
//                     {clientAccountOptions && clientAccountOptions.map((acc, index) => (
//                       <option key={acc.id} value={acc.accountNumber}>
//                         {acc.accountNumber}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="uk-form-controls uk-width-1-2">
//                   <label className="uk-form-label required" htmlFor="">
//                     To Account
//                   </label>
//                   <select
//                     className="uk-select uk-form-small"
//                     value={switchTransaction.toAccount}
//                     id="clientAccount"
//                     name={"clientAccount"}
//                     onChange={(e) =>
//                       setSwitchTransaction({
//                         ...switchTransaction,
//                         toAccount: e.target.value,
//                       })
//                     }
//                     required
//                   >
//                     <option value={""} disabled>
//                       Select...
//                     </option>
//                     {clientAccountOptions
//                       .filter(
//                         (account) =>
//                           account.accountNumber !==
//                           switchTransaction.fromAccount
//                       )
//                       .map((acc) => (
//                         <option
//                           key={acc.id}
//                           value={acc.accountNumber}
//                         >
//                           {acc.accountNumber}
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//               </>
//             }
//             {
//               clientName && clientAccountOptions.length < 2 &&
//               <p>This Client only has one Money market account so a switch cannot be performed</p>
//             }
//             <div className="uk-grid uk-grid-small uk-child-width-1-2 uk-width-1-1">
//               {fromAccount && (
//                 <div className="uk-card">
//                   <div className="uk-card-body">
//                     <h4>Switch-From Account Information</h4>
//                     <div className="uk-grid uk-grid-small">
//                       <div className="uk-width-1-3">
//                         <p>Account Number</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{fromAccount.asJson.accountNumber}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Account Name</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{fromAccount.asJson.accountName}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Account Type</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         {/* <p>{fromAccount.asJson.accountType}</p> */}
//                         <p>
//                           {fromAccount.asJson.accountType}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Fee Rate</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{fromAccount.asJson.feeRate}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Cession</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{(fromAccount.asJson.cession)}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Balance</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{(fromAccount.asJson.balance)}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Display on Statement</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {fromAccount.asJson.displayOnEntityStatement
//                             ? "Yes"
//                             : "No"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               {toAccount && (
//                 <div className="uk-card">
//                   <div className="uk-card-body">
//                     <h4>Switch-To Account Information</h4>
//                     <div className="uk-grid uk-grid-small" data-uk-grid>
//                       <div className="uk-width-1-3">
//                         <p>Account Number</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{toAccount.asJson.accountNumber}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Account Name</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{toAccount.asJson.accountName}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Account Type</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         {/* <p>{toAccount.asJson.accountType}</p> */}
//                         <p>
//                           {toAccount.asJson.accountType}
//                         </p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Fee Rate</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{toAccount.asJson.feeRate}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Cession</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{(toAccount.asJson.cession)}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Balance</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>{(toAccount.asJson.balance)}</p>
//                       </div>
//                       <hr className="uk-width-1-1" />
//                       <div className="uk-width-1-3">
//                         <p>Display on Statement</p>
//                       </div>
//                       <div className="uk-width-2-3">
//                         <p>
//                           {toAccount.asJson.displayOnEntityStatement
//                             ? "Yes"
//                             : "No"}
//                         </p>
//                       </div>
//                     </div>
//                     <DetailView dataToDisplay={toAccountDetails} />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="uk-form-controls uk-width-1-2">
//               <label className="uk-form-label required" htmlFor="">
//                 Amount
//               </label>
//               <NumberInput
//                 className="uk-input uk-form-small"
//                 onChange={(value) => setSwitchTransaction({
//                   ...switchTransaction,
//                   amount: Number(value),
//                 })}
//                 max={fromAccount?.asJson.balance} value={switchTransaction.amount} />

//               <div className="uk-width-1-1">
//                 {/* <InstructionFileUploader
//                   onFileUpload={handleInstructionFileUpload}
//                   onProvideReason={handleReasonForNoAttachment}
//                   fileUrl={instructionFileURL}
//                   reasonForNotProvingFile={
//                     switchTransaction.reasonForNoInstruction
//                   }
//                   label="Client Instruction"
//                   allocation={`from ${switchTransaction.fromAccount} -to ${switchTransaction.toAccount}`}
//                 /> */}
//                 <InstructionFileUploader
//                   onFileUpload={handleInstructionFileUpload}
//                   onProvideReason={handleReasonForNoAttachment}
//                   fileUrl={instructionFileURL}
//                   reasonForNotProvingFile={
//                     switchTransaction.reasonForNoInstruction
//                   }
//                   value={reasonForNoAttachment}
//                   label="Client Instruction"
//                   fileValue={instructionFileURL}
//                   allocation={`from ${switchTransaction.fromAccount} -to ${switchTransaction.toAccount}`}
//                 />
//               </div>
//             </div>
//             <div className="uk-width-1-2"></div>
//             <div className="uk-form-controls">
//               <button className="btn btn-primary" type="submit" disabled={loading}>
//                 Switch
//                 {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-danger"
//                 onClick={onCancel}>
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div >
//     </ErrorBoundary >
//   );
// });

// export default RecordSwitchModal;
