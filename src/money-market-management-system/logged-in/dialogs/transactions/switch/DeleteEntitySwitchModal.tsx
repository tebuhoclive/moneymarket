import { FormEvent, useEffect, useRef, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import React from "react";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { ISwitchTransaction, defaultSwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
import swal from "sweetalert";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../shared/utils/utils";
import NormalClientStatement from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import FormattedNumberInput from "../../../../../shared/functions/FormattedNumberInput";
import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import NormalClientStatementSplit from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatementSplit";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { toJS } from "mobx";
import { ClientSwitchAuditTrailView } from "../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientSwitchesAuditTrailView";
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const startOfMonthBackDating = new Date(currentYear, currentMonth, 2);
interface ObjectType {
    label: string;
    value: string
}
const defaultObjectType: ObjectType = {
    label: "",
    value: ""
}
interface IProps {
    setVisible: (show: boolean) => void;
}
const DeleteEntitySwitchModal = observer(({ setVisible }: IProps) => {
    const { api, store } = useAppContext();
    const [selectedClientAccountNumber, setSelectedClientAccountNumber] = useState<ObjectType>({ ...defaultObjectType });
    const [selectedClientAccountNumberTo, setSelectedClientAccountNumberTo] = useState<ObjectType>({ ...defaultObjectType });
    const [selectedClient, setSelectedClient] = useState<
        INaturalPerson | ILegalEntity | null
    >();
    const [selectedClientTo, setSelectedClientTo] = useState<
        INaturalPerson | ILegalEntity | null
    >();
    const [loading, setLoading] = useState<boolean>(false);
    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];
    const auditTrail = store.switchAudit.all;

    const switchTransactionAudit = auditTrail.sort((a, b) => {
        const dateA = new Date(a.asJson.auditDateTime || 0);
        const dateB = new Date(b.asJson.auditDateTime || 0);
        return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });

    const [switchTransaction, setSwitchTransaction] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });
    const [switchTransactionTo, setSwitchTransactionTo] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction });
    const [oldSwitchTransaction, setOldSwitchTransaction] = useState<ISwitchTransaction>({ ...defaultSwitchTransaction })
    const moneyMarketAccounts = store.mma.all;
    const [backDatingTransaction, setBackDatingTransaction] = useState(false);
    const [verifyBackDating, setVerifyBackDating] = useState(false);
    const [futureDatingTransaction, setFutureDatingTransaction] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Withdrawal");
    const [saving, setSaving] = useState(false);
    const [isUploadPOP, setIsUploadPOP] = useState<boolean>(false);
    const [filePOP, setFilePOP] = useState<File | null>(null);
    const [fileUploadProgressPOP, setFileUploadProgressPOP] = useState(0);
    const fileInputRefPOP = useRef<HTMLInputElement>(null);
    const [loadingPOP, setLoadingPOP] = useState(false);
    const [selectedClientAccounts, setSelectedClientAccounts] = useState<IMoneyMarketAccount[]>([]);
    const [fileUrlPOP, setFileUrlStatePOP] = useState<string | null>(null);
    const [fromAccount, setFromAccount] = useState<any>(null);
    const [toAccount, setToAccount] = useState<any>(null);
    const fromAccountDetails: IDataDisplay[] = [
        {
            label: "Account Name",
            value: fromAccount ? fromAccount.asJson.accountName : ""
        },
        {
            label: "Account Number",
            value: fromAccount ? fromAccount.asJson.accountNumber : ""
        },
        {
            label: "Account Type",
            value: fromAccount ? fromAccount.asJson.accountType : ""
        },
        {
            label: "Client Rate",
            value: fromAccount ? fromAccount.asJson.clientRate ? fromAccount.asJson.clientRate : "-" : 0
        },
        {
            label: "Balance",
            value: fromAccount ? currencyFormat(fromAccount.asJson.balance) : ""
        },
    ]
    const toAccountDetails: IDataDisplay[] = [
        {
            label: "Account Name",
            value: toAccount ? toAccount.asJson.accountName : ""
        },
        {
            label: "Account Number",
            value: toAccount ? toAccount.asJson.accountNumber : ""
        },
        {
            label: "Account Type",
            value: toAccount ? toAccount.asJson.accountType : ""
        },
        {
            label: "Client Rate",
            value: toAccount ? toAccount.asJson.clientRate ? toAccount.asJson.clientRate : "-" : 0
        },
        {
            label: "Balance",
            value: toAccount ? currencyFormat(toAccount.asJson.balance) : ""
        },
    ]
    const switchDetails: IDataDisplay[] = [
        { label: "Switch Amount", value: String(currencyFormat(switchTransaction.amount)) },
        { label: "Value Date", value: dateFormat_DD_MM_YY(switchTransaction.valueDate) },
        { label: "Reference", value: switchTransaction.reference },
    ]
    const handleClientAccountChange = (accountNumber: string) => {
        const _fromAccount = moneyMarketAccounts.find((account) =>
            account.asJson.accountNumber === accountNumber
        );
        if (_fromAccount) {
            setFromAccount(_fromAccount)
        }
        setSelectedClientAccountNumber({ label: selectedClientAccountNumber.label, value: accountNumber });
        store.statementTransaction.removeAll();
        const selectedAccount = store.mma.all.find(
            (mma) => mma.asJson.accountNumber === accountNumber
        );
        if (selectedAccount) {
            store.mma.select(selectedAccount.asJson);
            const account = store.mma.selected;
            if (account) {
                const client = clients.find(
                    (client) => client.asJson.entityId === account.parentEntity
                );
                if (client) {
                    setSelectedClient(client.asJson);
                    setSwitchTransaction({
                        ...switchTransaction,
                        fromAccount: account.accountNumber,
                        toEntityNumber: client.asJson.entityId
                    })
                }
                return "";
            }
        }
    };
    const handleClientAccountChangeTo = (accountNumber: string) => {
        const _toAccount = moneyMarketAccounts.find((account) =>
            account.asJson.accountNumber === accountNumber
        );
        if (_toAccount) {
            setToAccount(_toAccount);
        }
        console.log("Account Number " + accountNumber);
        setSelectedClientAccountNumberTo({ label: selectedClientAccountNumberTo.label, value: accountNumber });
        store.statementTransaction.removeAll();
        const selectedAccount = store.mma.all.find(
            (mma) => mma.asJson.accountNumber === accountNumber
        );
        if (selectedAccount) {
            store.mma.select(selectedAccount.asJson);
            const account = store.mma.selected;
            if (account) {
                const client = clients.find(
                    (client) => client.asJson.entityId === account.parentEntity
                );
                if (client) {
                    setSelectedClientTo(client.asJson);
                    setSwitchTransactionTo({
                        ...switchTransaction,
                        toAccount: account.accountNumber,
                        fromEntityNumber: client.asJson.entityId
                    })
                }
                return "";
            }
        }
    };
    const isDraftDisabled = () => {
        if (!fromAccount || !toAccount) {
            console.log("No From account ", fromAccount)
            console.log("No to  account", toAccount)
            return true;
        }
        if (
            !switchTransaction.fromAccount &&
            !switchTransaction.toAccount
        ) {
            console.log("Not switchTo")
            return true;
        }
        return false;
    };
    const displayMessage = () => {
        if (isDraftDisabled()) {
            return <p>To Draft select both the "From Account" and "To Account".</p>
        } else {
            return null;
        }
    }
    const handleFileSelectPOP = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFilePOP(selectedFile);
            await handleFileUploadPOP(selectedFile);
        }
    };
    const handleFileUploadPOP = async (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/switches/${dateFormat_DD_MM_YY(Date.now())}/${switchTransaction.fromAccount}/Client Instruction`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFileUploadProgressPOP(progress);
        });
        try {
            setLoadingPOP(true);
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            setSwitchTransaction({
                ...switchTransaction,
                clientInstruction: {
                    url: downloadURL,
                    reasonForNotAttaching: ""
                }
            })
            setFileUrlStatePOP(downloadURL);
            setFilePOP(null);
            setFileUploadProgressPOP(0);
            setLoadingPOP(false);
        } catch (error) {
            console.error("File upload failed:", error);
            setLoadingPOP(false);
        }
    };
    const handleReasonChangePOP = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setSwitchTransaction({
            ...switchTransaction,
            clientInstruction: {
                url: "",
                reasonForNotAttaching: value
            }
        })
    };
    const onDelete = () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                setLoading(true);
                if (fromAccount && toAccount) {
                    if (futureDatingTransaction) {
                        const _switchTransaction: ISwitchTransaction = {
                            ...switchTransaction,
                            id: switchTransaction.id,
                            transactionDate: switchTransaction.transactionDate,
                            valueDate: switchTransaction.valueDate, toEntityNumber: switchTransaction.fromEntityNumber ?? "",
                            fromAccount: switchTransaction.fromAccount ?? "",
                            fromEntityNumber: switchTransactionTo.toEntityNumber ?? "",
                            createdAt: Date.now(),
                            toAccount: switchTransactionTo.toAccount,
                            switchTransactionProcess: "Future-Dated",
                            description: switchTransaction.description,
                            amount: switchTransaction.amount,
                            switchStatus: "First Level",
                            switchAction: "Deleted",
                            clientInstruction: {
                                url: switchTransaction.clientInstruction.url,
                                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                            },
                            createdAtTime: {
                                deletedQueue: Date.now()
                            },
                            reference: switchTransaction.reference || `Switch from ${switchTransaction.fromAccount} to ${switchTransactionTo.toAccount}`,
                            switchedBy: store.auth.meUID || "",
                            transactionType: "Manual Switch",
                            fromProductCode: fromAccount.asJson.accountType,
                            toProductCode: toAccount.asJson.accountType,
                            returnNote: switchTransaction.returnNote ?? "",
                            reasonForDeleting: switchTransaction.reasonForDeleting ?? ""
                        };

                        try {
                            await api.switch.update(_switchTransaction);
                        } catch (error) {

                        }
                    } else if (backDatingTransaction) {
                        const _switchTransaction: ISwitchTransaction = {
                            ...switchTransaction,
                            id: switchTransaction.id,
                            transactionDate: switchTransaction.transactionDate,
                            valueDate: switchTransaction.valueDate, toEntityNumber: switchTransaction.fromEntityNumber,
                            fromAccount: switchTransaction.fromAccount,
                            fromEntityNumber: switchTransactionTo.toEntityNumber,
                            createdAt: Date.now(),
                            toAccount: switchTransactionTo.toAccount,
                            switchTransactionProcess: "Back-Dated",
                            description: switchTransaction.description,
                            amount: switchTransaction.amount,
                            switchStatus: "First Level",
                            switchAction: "Deleted",
                            clientInstruction: {
                                url: switchTransaction.clientInstruction.url,
                                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                            },
                            createdAtTime: {
                                deletedQueue: Date.now()
                            },
                            reference: switchTransaction.reference || `Switch from ${switchTransaction.fromAccount} to ${switchTransactionTo.toAccount}`,
                            switchedBy: store.auth.meUID || "",
                            transactionType: "Manual Switch",
                            fromProductCode: fromAccount.asJson.accountType,
                            toProductCode: toAccount.asJson.accountType,
                            returnNote: switchTransaction.returnNote ?? "",
                            reasonForDeleting: switchTransaction.reasonForDeleting ?? ""

                        };

                        try {
                            await api.switch.update(_switchTransaction);
                        } catch (error) {

                        }
                    } else {
                        const _switchTransaction: ISwitchTransaction = {
                            ...switchTransaction,
                            id: switchTransaction.id,
                            transactionDate: switchTransaction.transactionDate,
                            valueDate: switchTransaction.valueDate, toEntityNumber: switchTransaction.toEntityNumber,
                            fromAccount: switchTransaction.fromAccount,
                            fromEntityNumber: switchTransactionTo.fromEntityNumber,
                            createdAt: Date.now(),
                            toAccount: switchTransactionTo.toAccount,
                            switchTransactionProcess: "Normal",
                            description: switchTransaction.description,
                            amount: switchTransaction.amount,
                            switchStatus: "First Level",
                            switchAction: "Deleted",
                            clientInstruction: {
                                url: switchTransaction.clientInstruction.url,
                                reasonForNotAttaching: switchTransaction.clientInstruction.reasonForNotAttaching
                            },
                            createdAtTime: {
                                deletedQueue: Date.now()
                            },
                            reference: switchTransaction.reference || `Switch from ${switchTransaction.fromAccount} to ${switchTransactionTo.toAccount}`,
                            switchedBy: store.auth.meUID || "",
                            transactionType: "Manual Switch",
                            fromProductCode: fromAccount.asJson.accountType,
                            toProductCode: toAccount.asJson.accountType,
                            returnNote: switchTransaction.returnNote ?? "",
                            reasonForDeleting: switchTransaction.reasonForDeleting ?? ""
                        };
                        try {
                            await api.switch.update(_switchTransaction);
                        } catch (error) {
                        }
                    }
                }
                swal({
                    icon: "success",
                    text: "Switch Submitted For Deletion",
                });
                onCancel();
            }
        });
        setLoading(false);
    };
    const onCancel = () => {
        store.switch.clearSelected();
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DELETE_SWITCH_ENTITIES_MODAL);
        setLoading(false);
        setVisible(false);
    };
    useEffect(() => {
        if (store.switch.selected && store.switch.selected !== undefined) {
            const selectedSwitchTransaction = toJS(store.switch.selected);
            if (selectedSwitchTransaction.id) {
                setSwitchTransaction(selectedSwitchTransaction);
                setOldSwitchTransaction(selectedSwitchTransaction);
                const moneyMarketAccountsJs = toJS(moneyMarketAccounts);
                const fromAccount = moneyMarketAccountsJs.find((account) =>
                    account.asJson.accountNumber === selectedSwitchTransaction.fromAccount
                );
                const toAccount = moneyMarketAccountsJs.find((account) =>
                    account.asJson.accountNumber === selectedSwitchTransaction.toAccount
                );
                setFromAccount(fromAccount || null);
                setToAccount(toAccount || null);
                if (fromAccount && toAccount) {
                    setSwitchTransactionTo({
                        ...switchTransaction,
                        toAccount: toAccount?.asJson.accountNumber,
                        fromEntityNumber: toAccount.asJson.parentEntity
                    })
                };
                setSelectedClientAccountNumber({
                    label: fromAccount ? `${fromAccount.asJson.accountNumber} - ${fromAccount.asJson.accountName ?? ""}` : "",
                    value: fromAccount ? fromAccount.asJson.accountNumber : ""
                });
                setSelectedClientAccountNumberTo({
                    label: toAccount ? `${toAccount.asJson.accountNumber} - ${toAccount.asJson.accountName ?? ""}` : "",
                    value: toAccount ? toAccount.asJson.accountNumber : ""
                });
                setIsUploadPOP(!!selectedSwitchTransaction.clientInstruction.url);
                setFileUrlStatePOP(selectedSwitchTransaction.clientInstruction.url || null);
            }
        }
    }, [store.switch.selected]);

    useEffect(() => {
        const loadData = async () => {
            if (switchTransaction.id) {
                await api.switchAudit.getAll(
                    switchTransaction.id
                );
            }
        };
        loadData();
    }, [api.switchAudit, api.user, switchTransaction.id]);
    useEffect(() => {
        const loadStatement = async () => {
            if (fromAccount && fromAccount.asJson.id) {
                try {
                    await Promise.all([
                        api.statementTransaction.getAll(fromAccount.asJson.id || ""),
                    ]);
                } catch (error) { }
            } else {
            }
        };
        loadStatement();
    }, [api.statementTransaction, fromAccount, selectedClientAccountNumber, selectedClientAccountNumberTo]);
    useEffect(() => {
        if (fromAccount && toAccount) {
            setSelectedClientAccounts([
                fromAccount.asJson,
                toAccount.asJson
            ]);
        }
    }, [fromAccount, toAccount]);
    useEffect(() => {
        console.log("switchTransaction updated:", switchTransaction);
    }, [switchTransaction]);
    useEffect(() => {
        if (fromAccount) {
            handleClientAccountChange(fromAccount.asJson.accountNumber);
        }
    }, []);
    useEffect(() => {
        if (toAccount) {
            handleClientAccountChangeTo(toAccount.asJson.accountNumber);
        }
    }, []);
    useEffect(() => {
        const loadData = async () => {
            if (switchTransaction.id) {
                await api.switchAudit.getAll(
                    switchTransaction.id
                );
            }
        };
        loadData();
    }, [api.switchAudit, api.user, switchTransaction.id]);

    return (
        <ErrorBoundary>
            <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-4-5">
                <button className="uk-modal-close-default"
                    type="button" data-uk-close></button>
                <div className="form-title">
                    <h3 style={{ marginRight: "1rem" }}>
                        Switch
                    </h3>
                    <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                    <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                        Manual Switch Transaction
                    </h3>
                </div>
                <hr />
                <div className="uk-margin-bottom uk-text-right">
                    <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
                        Switch View
                    </button>
                    <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
                        Statement View
                    </button>
                    <button className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit-Trail")}>
                        Audit Trail View
                    </button>
                </div>
                <div className="dialog-content uk-position-relative">
                    <div className="uk-grid uk-grid-small uk-child-width-1-1 uk-width-1-1" data-uk-grid>
                        {selectedTab === "Withdrawal" &&
                            <div className="uk-child-width-1-3@m uk-grid-small uk-grid-match" data-uk-grid>
                                <div className="uk-width-1-1">
                                    {displayMessage()}
                                    <form className="uk-grid uk-grid-small" data-uk-grid>
                                        <div className="uk-width-1-2">
                                            <h4 className="main-title-sm">Transaction Details</h4>
                                            <DetailView dataToDisplay={switchDetails} />

                                        </div>

                                        <div className="uk-width-1-2">
                                            <div className="uk-width-1-1">
                                                <label className="uk-form-label uk-display-block required">Reason For Deleting</label>
                                                <textarea
                                                    className="uk-form-small"
                                                    value={switchTransaction?.reasonForDeleting ?? ""}
                                                    onChange={(e) => setSwitchTransaction({
                                                        ...switchTransaction,
                                                        reasonForDeleting: e.target.value,
                                                    })}
                                                    placeholder="Please provide a reason"
                                                    required
                                                />
                                            </div>
                                            <label className="uk-form-label required" htmlFor="">
                                                Client Instruction:
                                            </label>
                                            {isUploadPOP ? //CHANGE
                                                <div>
                                                    <div data-uk-form-custom="target: true">
                                                        <input
                                                            type="file"
                                                            aria-label="Custom controls"
                                                            accept=".pdf, .jpg, .jpeg, .png, .eml"
                                                            onChange={handleFileSelectPOP} //
                                                            id="fileToAttach"
                                                            ref={fileInputRefPOP} //CHAN
                                                        />
                                                        <input
                                                            className="uk-form-small"
                                                            type="text"
                                                            placeholder={fileUrlPOP ? "Replace file" : "Select file"} //
                                                            aria-label="Custom controls"
                                                            disabled
                                                            value={fileUrlPOP === "" ? '' : filePOP?.name || ''}  //
                                                        />
                                                    </div>
                                                    {fileUrlPOP && ( //
                                                        <div>
                                                            <a
                                                                href={fileUrlPOP} //
                                                                target="_blank" rel="noopener noreferrer">View file</a>
                                                        </div>
                                                    )}
                                                    {loadingPOP && //
                                                        <progress
                                                            className="uk-progress uk-progress-success"
                                                            value={fileUploadProgressPOP} //
                                                            max="100"
                                                        />
                                                    }
                                                </div>
                                                :
                                                <div>

                                                    <textarea
                                                        className="uk-form-small"
                                                        cols={5}
                                                        value={switchTransaction?.clientInstruction.reasonForNotAttaching}
                                                        onChange={handleReasonChangePOP}//
                                                        disabled
                                                    />
                                                </div>
                                            }
                                        </div>
                                        <div className="uk-width-1-2">
                                            {fromAccount && (
                                                <div >
                                                    <h4 className="main-title-sm">Switch-From Account Information</h4>
                                                    <DetailView dataToDisplay={fromAccountDetails} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="uk-width-1-2">
                                            {toAccount && (
                                                <div >
                                                    <h4 className="main-title-sm">Switch-To Account Information</h4>
                                                    <DetailView dataToDisplay={toAccountDetails} />
                                                </div>
                                            )}
                                        </div>

                                        {futureDatingTransaction && (
                                            <div className="uk-width-1-2 uk-margin-bottom">
                                                <label className="uk-form-label required" htmlFor="">
                                                    Reason for Future Dating:
                                                </label>
                                                <textarea className="uk-form-small uk-textarea" name="reasonForFutureDating" id="reasonForFutureDating" cols={20} rows={5}
                                                    value={switchTransaction?.transactionNotes}
                                                    onChange={(e) => setSwitchTransaction({
                                                        ...switchTransaction,
                                                        transactionNotes: e.target.value,
                                                    })
                                                    }
                                                    disabled>
                                                </textarea>
                                            </div>
                                        )}
                                        {backDatingTransaction && (
                                            <div className="uk-width-1-2">
                                                <label className="uk-form-label required" htmlFor="">Reason for Back Dating:</label>
                                                <textarea className="uk-form-small uk-textarea" name="reasonForBackDating" id="reasonForBackDating"
                                                    cols={20}
                                                    value={switchTransaction?.transactionNotes}
                                                    onChange={(e) => setSwitchTransaction({
                                                        ...switchTransaction,
                                                        transactionNotes: e.target.value,
                                                    })
                                                    }
                                                    disabled>
                                                </textarea>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        }
                        {selectedTab === "Statement" &&
                            <div className="uk-width-1-1">
                                <NormalClientStatementSplit accountsToSplit={selectedClientAccounts} />
                            </div>
                        }
                        {selectedTab === "Audit-Trail" &&
                            <ClientSwitchAuditTrailView data={switchTransactionAudit} />

                        }
                    </div>
                </div>
                <div className="uk-margin-padding-top uk-text-right">
                    <button className="btn btn-danger" disabled={loading} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" disabled={loading} onClick={onDelete}>Delete</button>
                </div>
            </div>
        </ErrorBoundary>
    );
});

export default DeleteEntitySwitchModal;


