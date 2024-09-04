// import { FormEvent, useEffect, useState } from "react";

// import MODAL_NAMES from "../../ModalName";
// import Select from "react-select";
// import { observer } from "mobx-react-lite";
// import React from "react";
// import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
// import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { ISwitchTransaction, defaultSwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
// import swal from "sweetalert";
// import InstructionFileUploader from "../../../../../shared/components/instruction-file-upload/InstructionFileUploader";
// import NumberInput from "../../../shared/components/number-input/NumberInput";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { getByAccountNumber } from "./closeOutInterest";
// import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
// import { getMMAProduct } from "../../../../../shared/functions/MyFunctions";
// import { createCloseOffSwitchRecord } from "./CloseOutFunction";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { getCloseData } from "../../../../../shared/functions/transactions/CloseOut";
// import { NoData } from "../../../../../shared/components/nodata/NoData";
// import CloseOutStatementSwitch from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/CloseOutStatementSwitch";
// import SearchableSelect from "../../../shared/components/client-account-select-component/LotsSingleSelect";
// import FormattedNumberInput from "../../../../../shared/functions/FormattedNumberInput";

// const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();
// const startOfMonth = new Date(currentYear, currentMonth, 1);
// const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

// interface ObjectType {
//   label: string;
//   value: string
// }

// const defaultObjectType: ObjectType = {
//   label: "",
//   value: ""
// }


// interface IProps {
//   setVisible: (show: boolean) => void;
// }


// const RecordEntitySwitchModal = observer(({ setVisible }: IProps) => {
//   const { api, store } = useAppContext();
//   const [clientName, setClientName] = useState("");
//   const [selectedClientAccountNumber, setSelectedClientAccountNumber] = useState<ObjectType>({ ...defaultObjectType });
//   const [selectedClientAccountNumberTo, setSelectedClientAccountNumberTo] = useState<ObjectType>({ ...defaultObjectType });
//   const [searchBy, setSearchBy] = useState<string>("clientName");

//   // back dating  and future dating code starts here
//   const [selectedClient, setSelectedClient] = useState<
//     INaturalPerson | ILegalEntity | null
//   >();

//   const [selectedClientTo, setSelectedClientTo] = useState<
//     INaturalPerson | ILegalEntity | null
//   >();
//   const [loading, setLoading] = useState<boolean>(false);

//   const clients = [
//     ...store.client.naturalPerson.all,
//     ...store.client.legalEntity.all,
//   ];

//   const moneyMarketAccounts = store.mma.all;
//   const timeAuthorized = Date.now();
//   const formattedTime = new Date(timeAuthorized).toUTCString();

//   const [switchTransaction, setSwitchTransaction] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });
//   const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
//   const [switchTransactionTo, setSwitchTransactionTo] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });

//   const [newInterest, setNewInterest] = useState(0);
//   const [interestLoading, setInterestLoading] = useState(false);

//   let fromAccount = moneyMarketAccounts.find((account) => account.asJson.accountNumber === switchTransaction?.fromAccount);

//   let toAccount = moneyMarketAccounts.find((account) => account.asJson.accountNumber === switchTransactionTo.toAccount);

//   const [instructionFileURL, setInstructionFileURL] = useState("");
//   const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");

//   let closeOffBalance = (selectedClientAccount?.balance || 0) + newInterest;
//   let truncatedNumber: number = Math.floor(closeOffBalance * 100) / 100;

//   const handleInstructionFileUpload = (url: string) => {
//     // Handle the URL in the parent component
//     setInstructionFileURL(url);
//   };

//   const handleReasonForNoAttachment = (reason: string) => {
//     // Handle the URL in the parent component
//     setReasonForNoAttachment(reason);
//   };

//   const [clientAccountOptions, setClientAccountOptions] = useState<IMoneyMarketAccount[]>([]);

//   const [clientAccountOptionsTo, setClientAccountOptionsTo] = useState<IMoneyMarketAccount[]>([]);


//   const _clientAccountOptions = store.mma.all.map((acc) => {
//     return {
//       label: acc.asJson.accountNumber,
//       value: acc.asJson.accountNumber
//     }
//   })
//   const _clientAccountOptionsTo = store.mma.all.map((acc) => {
//     return {
//       label: acc.asJson.accountNumber,
//       value: acc.asJson.accountNumber
//     }
//   })


//   const clientOptions = clients.map((cli) => ({
//     label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//     value: cli.asJson.entityId,
//   }))
//     .sort((a, b) => {
//       const nameA = a.label;
//       const nameB = b.label;
//       return nameA.localeCompare(nameB);
//     });

//   const clientOptionsTo = clients.map((cli) => ({
//     label: `${cli.asJson.entityDisplayName} (${cli.asJson.entityId})`,
//     value: cli.asJson.entityId,
//   })).sort((a, b) => {
//     const nameA = a.label;
//     const nameB = b.label;
//     return nameA.localeCompare(nameB);
//   });

//   const clientBalance = () => {
//     const account = store.mma.all.find(
//       (mma) => mma.asJson.accountNumber === switchTransaction.fromAccount
//     );
//     return account ? account.asJson.balance - account.asJson.cession : 0;
//   };

//   const balance = clientBalance();

//   const handleClientAccountChange = async (accountNumber: string) => {
//     store.statementTransaction.removeAll();
//     const selectedAccount = store.mma.all.find(
//       (mma) => mma.asJson.accountNumber === accountNumber
//     );
//     if (selectedAccount) {
//       store.mma.select(selectedAccount.asJson);
//       const account = store.mma.selected;
//       if (account) {
//         setSelectedClientAccount(account);
//         const client = clients.find(
//           (client) => client.asJson.entityId === account.parentEntity
//         );
//         setInterestLoading(true);
//         const _closeOutDate = Date.now();
//         await getCloseData(account.id, store, api, startOfMonth, endOfMonth, _closeOutDate);
//         const interest = await getByAccountNumber(account.accountNumber);
//         setNewInterest(interest);
//         setInterestLoading(false);
//         if (client) {
//           setSelectedClient(client.asJson);
//         }
//         return "";
//       }
//     }
//   };

//   const handleClientChange = (entityId: string) => {
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     setClientAccountOptions([]);
//     toAccount = undefined;
//     fromAccount = undefined;

//     setClientName(entityId);

//     const _selectedClient = clients.find(
//       (client) => client.asJson.entityId === entityId
//     );

//     if (_selectedClient) {
//       setSelectedClient(_selectedClient.asJson);
//     }

//     const _clientAccountOptions = moneyMarketAccounts
//       .filter((mma) => mma.asJson.parentEntity === entityId)
//       .map((mma) => {
//         return mma.asJson;
//       });

//     if (_clientAccountOptions) {
//       setClientAccountOptions(_clientAccountOptions);
//     }
//   };

//   const handleClientChangeTo = (entityId: string) => {
//     setSwitchTransactionTo({ ...defaultSwitchTransaction });
//     setClientAccountOptionsTo([]);
//     toAccount = undefined;
//     fromAccount = undefined;

//     const _selectedClient = clients.find((client) => client.asJson.entityId === entityId);

//     if (_selectedClient) {
//       setSelectedClientTo(_selectedClient.asJson);
//     }

//     const _clientAccountOptions = moneyMarketAccounts
//       .filter((mma) => mma.asJson.parentEntity === entityId)
//       .map((mma) => {
//         return mma.asJson;
//       });

//     if (_clientAccountOptions) {
//       setClientAccountOptionsTo(_clientAccountOptions);
//     }
//   };

//   const handleFromAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     toAccount = undefined;
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     const selectedValue = e.target.value;
//     if (selectedValue === switchTransaction.fromAccount) {
//       toAccount = undefined;
//       setSwitchTransaction({ ...defaultSwitchTransaction });
//     }

//     handleClientAccountChange(selectedValue);
//     setSwitchTransaction({
//       ...switchTransaction,
//       fromAccount: selectedValue,
//       toAccount: "",
//     });

//     if (fromAccount) {

//     }
//   };

//   const handleDateChange = async (ijgValueDate: number) => {
//     // setSwitchTransaction({ ...switchTransaction, ijgValueDate: ijgValueDate });
//     try {
//       if (selectedClientAccount) {
//         if (dateFormat_YY_MM_DD(ijgValueDate) < dateFormat_YY_MM_DD(Date.now())) {
//           swal({
//             title: "Back Date Close Out?",
//             icon: "warning",
//             buttons: ["Cancel", "Continue"],
//             dangerMode: true,
//           }).then(async (edit) => {
//             if (edit) {

//               setInterestLoading(true);
//               await getCloseData(selectedClientAccount.id, store, api, startOfMonth, endOfMonth, ijgValueDate);
//               const interest = await getByAccountNumber(switchTransaction.fromAccount);
//               setNewInterest(interest);
//               setSwitchTransaction({ ...switchTransaction, amount: truncatedNumber, ijgValueDate: ijgValueDate })
//               setInterestLoading(false);
//             }
//           });
//         } else if (dateFormat_YY_MM_DD(ijgValueDate) > dateFormat_YY_MM_DD(Date.now())) {
//           swal({
//             title: "Future Date Close Out?",
//             icon: "warning",
//             buttons: ["Cancel", "Continue"],
//             dangerMode: true,
//           }).then(async (edit) => {

//             if (edit) {
//               setInterestLoading(true);
//               await getCloseData(selectedClientAccount.id, store, api, startOfMonth, endOfMonth, ijgValueDate);
//               const interest = await getByAccountNumber(switchTransaction.fromAccount);
//               setNewInterest(interest);
//               setSwitchTransaction({ ...switchTransaction, amount: truncatedNumber, ijgValueDate: ijgValueDate })
//               setInterestLoading(false);
//             }
//           });
//         } else {

//           setInterestLoading(true);
//           await getCloseData(selectedClientAccount.id, store, api, startOfMonth, endOfMonth, ijgValueDate);
//           const interest = await getByAccountNumber(switchTransaction.fromAccount);
//           setNewInterest(interest);
//           setSwitchTransaction({ ...switchTransaction, amount: truncatedNumber, ijgValueDate: ijgValueDate })
//           setInterestLoading(false);
//         }
//       }

//     } catch (error) {
//     }
//   }

//   const [toggleCloseOutStatement, setToggleCloseOutStatement] = useState(false);

//   const handleToggleCloseOutStatement = () => {
//     if (toggleCloseOutStatement === false) {
//       setToggleCloseOutStatement(true);
//     } else {
//       setToggleCloseOutStatement(false);
//     }
//   }

//   const handleSwitchBetweenAccounts = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();


//     swal({
//       title: "Are you sure?",
//       icon: "warning",
//       buttons: ["Cancel", "Switch & Close"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         if (fromAccount && toAccount) {

//           const _switchTransaction: ISwitchTransaction = {
//             ...switchTransaction,
//             switchDate: Date.now(),
//             entity: clientName,
//             fromAccount: switchTransaction.fromAccount,
//             fromProductCode: getMMAProduct(switchTransaction.fromAccount, store),
//             toAccount: switchTransactionTo.toAccount,
//             toProductCode: getMMAProduct(switchTransactionTo.toAccount, store),
//             amount: truncatedNumber,
//             executionTime: formattedTime,
//             switchStatus: "Pending",
//             switchAction: "Recorded",
//             reference: `Switch from Closed Account (${switchTransaction.fromAccount}) to Account (${switchTransaction.toAccount})`,
//             description: `Switch from Closed Account`,
//             instruction: instructionFileURL,
//             reasonForNoInstruction: reasonForNoAttachment,
//             createdAt: Date.now()
//           };

//           const updatedAccount: IMoneyMarketAccount = {
//             ...fromAccount.asJson,
//             monthTotalInterest: newInterest,
//             status: 'Awaiting Close Out',
//           };

//           try {
//             await api.switch.create(_switchTransaction);
//             await createCloseOffSwitchRecord(api, store, switchTransaction, fromAccount.asJson.parentEntity,
//               fromAccount.asJson.balance,
//               newInterest || 0,
//               fromAccount.asJson.clientRate || 0,
//             );
//             try {
//               await api.mma.update(updatedAccount);
//             } catch (error) {
//             }
//           } catch (error) {
//           }
//         }

//         swal({
//           icon: "success",
//           text: `Close Out has been initiated! To complete the close out, approve the switch transaction`,
//         });
//         onCancel();
//       }
//     });
//     setLoading(false);
//   };

//   const onCancel = () => {
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     setSwitchTransactionTo({ ...defaultSwitchTransaction });
//     hideModalFromId(MODAL_NAMES.BACK_OFFICE.CLOSE_MM_ACCOUNT_SWITCH);
//     setSelectedClient(null);
//     setSelectedClientTo(null);
//     setReasonForNoAttachment("");
//     setSelectedClientAccountNumberTo({ label: "", value: "" })
//     setSelectedClientAccountNumber({ label: "", value: "" })
//     setSearchBy("clientName");
//     setInstructionFileURL("");
//     setLoading(false);
//     setVisible(false);
//   };

//   useEffect(() => {
//     const loadStatement = async () => {
//       if (fromAccount && fromAccount.asJson.id) {
//         try {
//           await Promise.all([
//             api.statementTransaction.getAll(fromAccount.asJson.id || ""),
//           ]);
//         } catch (error) { }
//       } else {
//       }
//     };

//     loadStatement();
//   }, [api.statementTransaction, fromAccount]);

//   //new

//   const handleAmountChange = (newAmount: number) => {
//     setSwitchTransaction({
//       ...switchTransaction,
//       amount: newAmount,
//     })
//   };

//   const handleClientNameChange = (selectedOption: { value: string; label: string } | null) => {
//     if (selectedOption?.value) {
//       // Check for entityId property
//       handleClientChange(selectedOption.value);
//     }
//   };
//   const handleClientNameChangeTo = (selectedOption: { value: string; label: string } | null) => {
//     if (selectedOption?.value) {
//       // Check for entityId property
//       handleClientChangeTo(selectedOption.value);
//     }
//   };

//   const handleAccountNumberChangeFrom = (selectedOption: { value: string; label: string } | null) => {
//     toAccount = undefined;
//     setSwitchTransaction({ ...defaultSwitchTransaction });
//     const selectedValue = selectedOption?.value || "";
//     if (selectedValue === switchTransaction.fromAccount) {
//       toAccount = undefined;
//       setSwitchTransaction({ ...defaultSwitchTransaction });
//     }

//     handleClientAccountChange(selectedValue);
//     setSwitchTransaction({
//       ...switchTransaction,
//       fromAccount: selectedValue,
//       toAccount: "",
//     });
//     setSelectedClientAccountNumber({ label: selectedValue, value: selectedValue })
//     if (fromAccount) {

//     }
//   };

//   const handleAccountNumberChangeTo = (selectedOption: { value: string; label: string } | null) => {
//     setSwitchTransactionTo({
//       ...switchTransactionTo,
//       toAccount: selectedOption?.value || "",
//     })
//     setSelectedClientAccountNumberTo({
//       label: selectedOption?.label || "",
//       value: selectedOption?.value || ""
//     })
//   };

  

//   return (
//     <ErrorBoundary>
//       <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
//         <button
//           className="uk-modal-close-default"
//           onClick={onCancel}
//           type="button"
//           data-uk-close></button>
//         <h3 className="main-title-lg text-to-break">
//           Close Out (Capitalise, Switch)
//         </h3>
//         <hr />
//         <div className="dialog-content uk-position-relative">
//           {interestLoading ? (
//             <div style={{ textAlign: "center" }}>
//               <LoadingEllipsis />
//               <h2 style={{ color: "#004c98" }}>
//                 Updating accrued interest....
//               </h2>
//             </div>
//           ) : (
//             <>
//               {selectedClientAccount &&
//                 selectedClientAccount.accountNumber !== "" && (
//                   <>
//                     <button
//                       onClick={handleToggleCloseOutStatement}
//                       className="btn btn-primary btn-small">
//                       {toggleCloseOutStatement
//                         ? "Show Close Out Form"
//                         : "Show Close Out Statement "}{" "}
//                     </button>
//                     <hr />
//                   </>
//                 )}

//               <div className="uk-margin">
//                 <select
//                   className="uk-input"
//                   style={{ width: "30%" }}
//                   value={searchBy}
//                   onChange={(e: any) => setSearchBy(e.target.value)}
//                 >
//                   <option value="clientName" >Search by client name</option>
//                   <option value="accountNumber">Search by client account number</option>
//                 </select>
//               </div>
//               <form
//                 className="uk-grid uk-grid-small"
//                 data-uk-grid
//                 onSubmit={handleSwitchBetweenAccounts}>
//                 {toggleCloseOutStatement && (
//                   <>
//                     {selectedClientAccount &&
//                       selectedClientAccount.accountNumber !== "" && (
//                         <>
//                           <h4>Close Out Statement (From Account)</h4>
//                           <CloseOutStatementSwitch
//                             isFromStatement={true}
//                             account={selectedClientAccount}
//                             closeOutDate={
//                               switchTransaction.ijgValueDate
//                                 ? switchTransaction.ijgValueDate
//                                 : Date.now()
//                             }
//                             closeOutTransaction={switchTransaction}
//                             interest={newInterest}
//                           />

//                           {
//                             toAccount &&
//                             <>
//                               <h4>Close Out Statement (To Account)</h4>
//                               <CloseOutStatementSwitch
//                                 isFromStatement={false}
//                                 account={toAccount.asJson}
//                                 closeOutDate={
//                                   switchTransaction.ijgValueDate
//                                     ? switchTransaction.ijgValueDate
//                                     : Date.now()
//                                 }
//                                 closeOutTransaction={switchTransaction}
//                                 interest={newInterest}
//                               />
//                             </>
//                           }
//                         </>
//                       )}
//                     {selectedClientAccount &&
//                       selectedClientAccount.accountNumber === "" && <NoData />}
//                   </>
//                 )}
//                 {!toggleCloseOutStatement && (
//                   <>
//                     <>
//                       {searchBy === "clientName" ?
//                         <>
//                           <div className="uk-form-controls uk-width-1-2">
//                             <label
//                               className="uk-form-label required"
//                               htmlFor="clientSelect">
//                               Client Name (From)
//                             </label>
//                             <SearchableSelect
//                               value={
//                                 selectedClient
//                                   ? {
//                                     label: selectedClient.entityDisplayName,
//                                     value: selectedClient.entityId,
//                                   }
//                                   : null
//                               }
//                               options={clientOptions}
//                               onChange={handleClientNameChange}
//                               placeholder="Select a name"
//                             />
//                           </div>
//                           <div className="uk-form-controls uk-width-1-2">
//                             <label className="uk-form-label required" htmlFor="">
//                               Client Name (To)
//                             </label>
//                             <SearchableSelect
//                               value={
//                                 selectedClientTo
//                                   ? {
//                                     label: selectedClientTo.entityDisplayName,
//                                     value: selectedClientTo.entityId,
//                                   }
//                                   : null
//                               }
//                               options={clientOptionsTo}
//                               onChange={handleClientNameChangeTo}
//                               placeholder="Select a name"
//                             />
//                           </div>
//                           {/* <div className="uk-width-1-2"></div> */}
//                           {clientAccountOptions && (
//                             <div className="uk-form-controls uk-width-1-2">
//                               <label className="uk-form-label required" htmlFor="">
//                                 From Account
//                               </label>
//                               <select
//                                 className="uk-select uk-form-small"
//                                 value={switchTransaction.fromAccount}
//                                 id="clientAccount"
//                                 name={"clientAccount"}
//                                 onChange={handleFromAccountChange}
//                                 required>
//                                 <option value={""} disabled>
//                                   Select...
//                                 </option>
//                                 {clientAccountOptions &&
//                                   clientAccountOptions.map((acc, index) => (
//                                     <option
//                                       className={`${acc.status !== "Active"
//                                         ? "uk-text-danger"
//                                         : ""
//                                         }`}
//                                       key={acc.id}
//                                       value={acc.accountNumber}
//                                       disabled={acc.status !== "Active"}>
//                                       {acc.accountNumber}{" "}
//                                       {acc.status !== "Active" ? acc.status : ""}
//                                     </option>
//                                   ))}
//                               </select>
//                             </div>
//                           )}
//                           {clientAccountOptionsTo && (
//                             <div className="uk-form-controls uk-width-1-2">
//                               <label className="uk-form-label required" htmlFor="">
//                                 To Account
//                               </label>
//                               <select
//                                 className="uk-select uk-form-small"
//                                 value={switchTransactionTo.toAccount}
//                                 id="clientAccountTo"
//                                 name={"clientAccountTo"}
//                                 onChange={(e) =>
//                                   setSwitchTransactionTo({
//                                     ...switchTransactionTo,
//                                     toAccount: e.target.value,
//                                   })
//                                 }
//                                 required>
//                                 <option value={""} disabled>
//                                   Select...
//                                 </option>
//                                 {clientAccountOptionsTo
//                                   .filter(
//                                     (account) =>
//                                       account.accountNumber !==
//                                       switchTransactionTo.fromAccount
//                                   )
//                                   .map((acc) => (
//                                     <option
//                                       className={`${acc.status !== "Active"
//                                         ? "uk-text-danger"
//                                         : ""
//                                         }`}
//                                       key={acc.id}
//                                       value={acc.accountNumber}
//                                       disabled={acc.status !== "Active"}>
//                                       {acc.accountNumber}{" "}
//                                       {acc.status !== "Active" ? acc.status : ""}
//                                     </option>
//                                   ))}
//                               </select>
//                             </div>
//                           )}
//                         </> :
//                         <>
//                           <div className="uk-form-controls uk-width-1-2">
//                             <SearchableSelect
//                               value={selectedClientAccountNumber}
//                               options={_clientAccountOptions}
//                               onChange={handleAccountNumberChangeFrom}
//                               placeholder="Select account number"
//                             />
//                           </div>
//                           <div className="uk-form-controls uk-width-1-2">
//                             <SearchableSelect
//                               value={selectedClientAccountNumberTo}
//                               options={_clientAccountOptionsTo}
//                               onChange={handleAccountNumberChangeTo}
//                               placeholder="Select account number"
//                             />
//                           </div>
//                         </>

//                       }

//                     </>




//                     <div className="uk-form-controls uk-width-1-2 uk-margin-remove">
//                       <div className="uk-grid uk-grid-small uk-child-width-1-1 ">
//                         {fromAccount && (
//                           <div className="uk-card">
//                             <div className="uk-card-body">
//                               <h4 className="main-title-sm">
//                                 Switch-From Account Information
//                               </h4>
//                               <div
//                                 className="uk-grid uk-grid-small"
//                                 data-uk-grid>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Account Number</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{fromAccount.asJson.accountNumber}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Account Name</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{fromAccount.asJson.accountName}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Account Type</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   {/* <p>{fromAccount.asJson.accountType}</p> */}
//                                   <p>{fromAccount.asJson.accountType}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Fee Rate</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{fromAccount.asJson.feeRate}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Cession</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>
//                                     {(fromAccount.asJson.cession)}
//                                   </p>
//                                 </div>

//                                 <div className="uk-width-1-3">
//                                   <p>Balance</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>
//                                     {(fromAccount.asJson.balance)}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="uk-form-controls uk-width-1-2 uk-margin-remove">
//                       <div className="uk-grid uk-grid-small uk-child-width-1-1">
//                         {toAccount && (
//                           <div className="uk-card">
//                             <div className="uk-card-body">
//                               <h4 className="main-title-sm">
//                                 Switch-To Account Information
//                               </h4>
//                               <div
//                                 className="uk-grid uk-grid-small"
//                                 data-uk-grid>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">
//                                     Account Number:
//                                   </p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{toAccount.asJson.accountNumber}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Account Name:</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{toAccount.asJson.accountName}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Account Type:</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   {/* <p>{toAccount.asJson.accountType}</p> */}
//                                   <p>{toAccount.asJson.accountType}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Client Rate:</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>{toAccount.asJson.feeRate}</p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Cession:</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>
//                                     {(toAccount.asJson.cession)}
//                                   </p>
//                                 </div>
//                                 <div className="uk-width-1-3">
//                                   <p className="uk-text-bold">Balance:</p>
//                                 </div>
//                                 <div className="uk-width-2-3">
//                                   <p>
//                                     {(toAccount.asJson.balance)}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="uk-form-controls uk-width-1-1 uk-margin-bottom">
//                       <div className="uk-grid">
//                         <div
//                           className="uk-width-2/3 uk-grid uk-grid-small uk-child-width-1-2"
//                           data-uk-grid>
//                           {switchTransaction.fromAccount && (
//                             <>
//                               <div>
//                                 {/* Add margin-bottom to create spacing */}
//                                 <label
//                                   className="uk-form-label required"
//                                   htmlFor="">
//                                   Value Date
//                                 </label>
//                                 <input
//                                   className="uk-input uk-form-small"
//                                   id="ijgValueDate"
//                                   value={switchTransaction.ijgValueDate ? dateFormat_YY_MM_DD(switchTransaction.ijgValueDate) : dateFormat_YY_MM_DD(Date.now())
//                                   }
//                                   type="date"
//                                   name="ijgValueDate"
//                                   onChange={(e) =>
//                                     handleDateChange(e.target.valueAsNumber)
//                                   }
//                                   required
//                                 />
//                               </div>

//                               <div>
//                                 <label
//                                   className="uk-form-label required"
//                                   htmlFor="">
//                                   Balance
//                                 </label>
//                                 <FormattedNumberInput
//                                   disabled={true}
//                                   amount={balance}
//                                   onAmountChange={handleAmountChange}
//                                 />
//                               </div>
//                               <div>
//                                 <label
//                                   className="uk-form-label required"
//                                   htmlFor="">
//                                   Interest
//                                 </label>
//                                 {/* <NumberInput
//                                   className="uk-input uk-form-small"
//                                   onChange={(value) =>
//                                     setSwitchTransaction({
//                                       ...switchTransaction,
//                                       amount: Number(value),
//                                     })
//                                   }
//                                   value={newInterest}
//                                   disabled
//                                 /> */}
//                                 <FormattedNumberInput
//                                   disabled={true}
//                                   amount={newInterest}
//                                   onAmountChange={handleAmountChange}
//                                 />
//                               </div>
//                               <div>
//                                 <label
//                                   className="uk-form-label required"
//                                   htmlFor="">
//                                   Capitalised Amount
//                                 </label>
//                                 <NumberInput
//                                   className="uk-input uk-form-small"
//                                   onChange={(value) =>
//                                     setSwitchTransaction({
//                                       ...switchTransaction,
//                                       amount: Number(value),
//                                     })
//                                   }
//                                   value={newInterest + balance}
//                                   disabled
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                         <div className="uk-width-expand">
//                           <InstructionFileUploader
//                             onFileUpload={handleInstructionFileUpload}
//                             onProvideReason={handleReasonForNoAttachment}
//                             fileUrl={instructionFileURL}
//                             reasonForNotProvingFile={
//                               switchTransaction.reasonForNoInstruction
//                             }
//                             value={reasonForNoAttachment}
//                             label="Client Instruction"
//                             fileValue={instructionFileURL}
//                             allocation={`from ${switchTransaction.fromAccount} -to ${switchTransaction.toAccount}`}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     <hr className="uk-width-1-1" />
//                     <div className="uk-width-1-1"></div>
//                     <div className="uk-form-controls">
//                       <button
//                         type="button"
//                         className="btn btn-danger"
//                         onClick={onCancel}
//                         disabled={loading}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="btn btn-primary"
//                         disabled={loading}>
//                         Switch & Close{" "}
//                         {loading && <div data-uk-spinner={"ratio:.5"}></div>}
//                       </button>

//                     </div>
//                   </>
//                 )}
//               </form>
//             </>
//           )}
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// });

// export default RecordEntitySwitchModal;

import React from 'react'

const CloseModalWithSwitch = () => {
  return (
    <div>
      
    </div>
  )
}

export default CloseModalWithSwitch

