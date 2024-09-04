import { observer } from "mobx-react-lite"
import swal from "sweetalert";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { dateFormat_YY_MM_DD, sortAlphabetically } from "../../../../../../../../shared/utils/utils";
import ErrorBoundary from "../../../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { DepositAmendForm } from "./newDepositAmend";
import { getMMAProduct } from "../../../../../../../../shared/functions/MyFunctions";
import { hideModalFromId } from "../../../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../../../ModalName";
import { defaultMoneyMarketAccount, IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { INaturalPerson } from "../../../../../../../../shared/models/clients/NaturalPersonModel";
import { ILegalEntity } from "../../../../../../../../shared/models/clients/LegalEntityModel";
import Toolbar from "../../../../../../shared/components/toolbar/Toolbar";

interface IProps {
    isVisible: (show: boolean) => void;
}

export const DepositAmendModal = observer(({ isVisible }: IProps) => {
    const { store, api } = useAppContext();
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const [backDatingTransaction, setBackDatingTransaction] = useState(false);
    const [futureDatingTransaction, setFutureDatingTransaction] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Form");
    const [loading, setLoading] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
    const [selectedClientProfile, setSelectedClientProfile] = useState<INaturalPerson | ILegalEntity | null>();
    const [entityId, setEntityId] = useState("");
    const [editAccount, setEditAccount] = useState<boolean>(false);
    const [switchAccount, setSwitchAccount] = useState(depositTransaction.accountNumber);
    const [showOtherSource, setShowOtherSource] = useState(false);
    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];
    const mmAccounts = store.mma.all;
    const getClientName = (entityNumber: string) => {
        if (entityNumber !== "") {
            const client = clients.find((client) => client.asJson.entityId === entityNumber);
            return client?.asJson.entityDisplayName;
        } else {
            return "--------------------";
        }
    };
    const clientOptions = clients.map((cli) => ({
        label: cli.asJson.entityDisplayName,
        value: cli.asJson.entityId,
    }));
    const handleClientAccountChange = (accountNumber: string) => {
        if (accountNumber) {
            const account = mmAccounts.find(account => account.asJson.accountNumber === accountNumber);
            if (account) {
                const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity)
                if (client) {
                    setSelectedClientProfile(client.asJson);
                    setSelectedClientAccount(account.asJson);
                    setDepositTransaction(
                        {
                            ...depositTransaction,
                            accountNumber: account.asJson.accountNumber,
                            entityNumber: client.asJson.entityId
                        }
                    )
                }
            }
        } else {
            // Handle the case when accountNumber is empty (cleared)
            setSelectedClientProfile(null);
            setSelectedClientAccount(defaultMoneyMarketAccount);
            setDepositTransaction(
                {
                    ...depositTransaction,
                    accountNumber: '',
                    entityNumber: ''
                }
            )
        }
    };
    const clientAccountOptions = store.mma.all.filter((mma) => mma.asJson.parentEntity === entityId && mma.asJson.status === "Active");
    const clientAccountOptionsForAccount = store.mma.all.filter((mma) => mma.asJson.status === "Active").sort((a, b) => sortAlphabetically(a.asJson.accountName, b.asJson.accountName)).map((d) => {
        return {
            label: `${d.asJson.accountNumber} - ${d.asJson.accountName}`,
            value: d.asJson.accountNumber
        }
    });
    const handleReAllocate = (value: boolean) => {
        setEditAccount(value);

    }
    const handleAmountChange = (newAmount: number) => {
        setDepositTransaction({
            ...depositTransaction,
            amount: newAmount,
        });
    };
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = event.target.valueAsNumber;
        if (dateFormat_YY_MM_DD(selectedDate) > dateFormat_YY_MM_DD(Date.now())) {
            swal({
                title: "Transaction Future Dating",
                text: `Do you want to record a Deposit that will be future dated to ${dateFormat_YY_MM_DD(selectedDate)}`,
                icon: "warning",
                buttons: ["Cancel", "Future Date"],
                dangerMode: true,
            }).then(async (edit) => {
                setLoading(true);
                if (edit) {
                    swal({
                        icon: "warning",
                        text: `You are now recording a Deposit that will be future dated to ${dateFormat_YY_MM_DD(selectedDate)}`,
                    });
                    setDepositTransaction({
                        ...depositTransaction,
                        valueDate: selectedDate,
                        depositTransactionProcess: "Future-Dated",
                    });
                    setBackDatingTransaction(false);
                    setFutureDatingTransaction(true);
                }
                setLoading(false);
            });
        } else if (
            dateFormat_YY_MM_DD(selectedDate) < dateFormat_YY_MM_DD(Date.now())
        ) {
            swal({
                title: "Transaction Back Dating",
                text: `Do you want to record a Deposit that will be back dated to ${dateFormat_YY_MM_DD(selectedDate)}`,
                icon: "warning",
                buttons: ["Cancel", "Back Date"],
                dangerMode: true,
            }).then(async (edit) => {
                setLoading(true);
                if (edit) {
                    swal({
                        icon: "warning",
                        text: `You are now recording a Deposit that will be back dated to ${dateFormat_YY_MM_DD(selectedDate)}`,
                    });
                    setDepositTransaction({
                        ...depositTransaction,
                        valueDate: selectedDate,
                        depositTransactionProcess: "Back-Dated",
                    });
                    setFutureDatingTransaction(false);
                    setBackDatingTransaction(true);
                }
                setLoading(false);
            });
        } else {
            setDepositTransaction({
                ...depositTransaction,
                valueDate: selectedDate,
            });
            setBackDatingTransaction(false);
            setFutureDatingTransaction(false);
        }
    };
    const handleSaveAndUpdate = async (e?: any) => {
        e.preventDefault();
        setLoadingSave(true);
        if(depositTransaction.accountNumber){
            const saveTransaction: IDepositTransaction = {
                ...defaultDepositTransaction,
                id: depositTransaction.id,
                transactionDate: Date.now(),
                valueDate: depositTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
                amount: depositTransaction.amount,
                accountNumber: switchAccount ? switchAccount : depositTransaction.accountNumber,
                entityNumber: selectedClientProfile ? selectedClientProfile.entityId : depositTransaction.entityNumber,
                sourceBank: depositTransaction.sourceBank,
                bankReference: depositTransaction.bankReference === "" ? "Deposit" : depositTransaction.bankReference,
                sourceOfFundsAttachment: depositTransaction.sourceOfFundsAttachment,
                proofOfPaymentAttachment: depositTransaction.proofOfPaymentAttachment,
                statementIdentifier: `ID-${depositTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${depositTransaction.amount}-${depositTransaction.bankReference}`,
                sourceOfFunds: depositTransaction.sourceOfFunds,
                emailAddress: selectedClientProfile ? selectedClientProfile?.contactDetail.emailAddress : depositTransaction.emailAddress,
                transactionStatus: "Draft",
                transactionType: "Manual",
                transactionAction: "Amended, Updated and Saved",
                allocationStatus: "Manually Allocated",
                depositTransactionProcess: "Normal",
                productCode: getMMAProduct(
                    depositTransaction.accountNumber,
                    store
                ),
                createdAtTime: {
                    transactionQueue: Date.now(),
                },
                bankValueDate: depositTransaction.bankValueDate || 0,
                bankTransactionDate: depositTransaction.bankTransactionDate || 0,
                parentTransaction: depositTransaction.parentTransaction || "",
            }
            try {
                await api.depositTransaction.update(saveTransaction);
                onCancel();
            } catch (error) {
    
            }
            swal({
                icon: "success",
                text: "Transaction has been saved",
            });
        }else{
            const saveTransaction: IDepositTransaction = {
                ...defaultDepositTransaction,
                id: depositTransaction.id,
                transactionDate: Date.now(),
                valueDate: depositTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
                amount: depositTransaction.amount,
                accountNumber: switchAccount ? switchAccount : depositTransaction.accountNumber,
                entityNumber: selectedClientProfile ? selectedClientProfile.entityId : depositTransaction.entityNumber,
                sourceBank: depositTransaction.sourceBank,
                bankReference: depositTransaction.bankReference === "" ? "Deposit" : depositTransaction.bankReference,
                sourceOfFundsAttachment: depositTransaction.sourceOfFundsAttachment,
                proofOfPaymentAttachment: depositTransaction.proofOfPaymentAttachment,
                statementIdentifier: `ID-${depositTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${depositTransaction.amount}-${depositTransaction.bankReference}`,
                sourceOfFunds: depositTransaction.sourceOfFunds,
                emailAddress: selectedClientProfile ? selectedClientProfile?.contactDetail.emailAddress : depositTransaction.emailAddress,
                transactionStatus: "Unallocated",
                transactionType: "Manual",
                transactionAction: "Amended, Updated and Saved",
                allocationStatus: "Manually Allocated",
                depositTransactionProcess: "Normal",
                productCode: getMMAProduct(
                    depositTransaction.accountNumber,
                    store
                ),
                createdAtTime: {
                    transactionQueue: Date.now(),
                },
                bankValueDate: depositTransaction.bankValueDate || 0,
                bankTransactionDate: depositTransaction.bankTransactionDate || 0,
                parentTransaction: depositTransaction.parentTransaction || "",
            }
            try {
                await api.depositTransaction.update(saveTransaction);
                onCancel();
            } catch (error) {
    
            }
            swal({
                icon: "success",
                text: "Transaction has been saved",
            });
        }
      ;
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const saveTransaction: IDepositTransaction = {
                ...defaultDepositTransaction,
                id: depositTransaction.id,
                transactionDate: Date.now(),
                valueDate: depositTransaction.valueDate || Date.now(), // Set valueDate to current date if not set
                amount: depositTransaction.amount,
                accountNumber: switchAccount ? switchAccount : depositTransaction.accountNumber,
                sourceBank: depositTransaction.sourceBank,
                bankReference: depositTransaction.bankReference === "" ? "Deposit" : depositTransaction.bankReference,
                sourceOfFundsAttachment: depositTransaction.sourceOfFundsAttachment,
                proofOfPaymentAttachment: depositTransaction.proofOfPaymentAttachment,
                note:depositTransaction.note??"",
                statementIdentifier: `ID-${depositTransaction.accountNumber}-${dateFormat_YY_MM_DD(Date.now())}-${depositTransaction.amount}-${depositTransaction.bankReference}`,
                sourceOfFunds: depositTransaction.sourceOfFunds,
                transactionStatus: "First Level",
                transactionType: "Manual",
                allocationStatus: "Manually Allocated",
                depositTransactionProcess: "Normal",
                transactionAction: "Amended and Submitted For First level",
                emailAddress: selectedClientProfile ? selectedClientProfile?.contactDetail.emailAddress : depositTransaction.emailAddress,
                productCode: getMMAProduct(
                    depositTransaction.accountNumber,
                    store
                ),
                createdAtTime: {
                    firstLevelQueue: Date.now(),
                },
                bankValueDate: depositTransaction.bankValueDate || 0,
                bankTransactionDate: depositTransaction.bankTransactionDate || 0,
                parentTransaction: depositTransaction.parentTransaction || "",
                capturedBy: store.auth.meUID || ""
            };
            try {
                await api.depositTransaction.update(saveTransaction);
            } catch (error) {
                swal(`Error ${error}`);
             }
            swal({
                icon: "success",
                text:
                    "Transaction has been recorded and submitted for first level approval",
            });
            onCancel();
            setLoading(false);
            store.depositTransaction.clearSelected();
            setDepositTransaction({ ...defaultDepositTransaction });
        } catch (error) {
            swal(`Error ${error}`);
        } finally {
            onCancel();
            setLoading(false)
        }
    };
    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setShowOtherSource(value === "Other");

        // Clear the input field value when the user switches from 'Other' to another option
        if (value === "Other") {
            setDepositTransaction({
                ...depositTransaction,
                sourceOfFunds: depositTransaction.sourceOfFunds,
            });
        } else {
            setDepositTransaction({
                ...depositTransaction,
                sourceOfFunds: value,
            });
        }
    };
    useEffect(() => {
        if (store.depositTransaction.selected) {
            setDepositTransaction(store.depositTransaction.selected)
            const account = mmAccounts.find(account => account.asJson.accountNumber === store.depositTransaction.selected?.accountNumber);
            if (account) {
                const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity);
                if (client) {
                    setSelectedClientProfile(client.asJson);
                    setSelectedClientAccount(account.asJson);
                }
            }
        } else {

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.depositTransaction.selected])
    useEffect(() => {
        const loadData = async () => {
            if (depositTransaction.id) {
                await api.depositTransactionAudit.getAll(
                    depositTransaction.id
                );
            }
        };
        loadData();
    }, [api.depositTransactionAudit, api.user, depositTransaction.id]);

    let [onClearFileComponent, setOnClearFileComponent] = useState(false);

    const onCancel = () => {
        isVisible(false)
        setLoadingSave(false);
        setLoading(false);
        store.depositTransaction.clearSelected();
        setDepositTransaction({
            ...defaultDepositTransaction,
        });
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL)
        setEntityId("");
        setEditAccount(false);
    }

    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
                <button className="uk-modal-close-default" onClick={onCancel} disabled={loading || loadingSave} type="button" data-uk-close></button>
                <div className="form-title">
                    <h3 style={{ marginRight: "1rem" }}>
                        DEPOSIT
                    </h3>
                    <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                    <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                        Amend Transaction
                    </h3>
                </div>
                <hr />
                <Toolbar
                    rightControls={
                        <div className="uk-margin-bottom">
                            <button className={`btn ${selectedTab === "Form" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Form")}>
                                Deposit
                            </button>
                            <button
                                className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`}
                                onClick={() => setSelectedTab("Statement")}
                            >
                                View Statement
                            </button>
                            <button
                                className={`btn ${selectedTab === "Audit Trail" ? "btn-primary" : "btn-primary-in-active"}`}
                                onClick={() => setSelectedTab("Audit Trail")}
                            >
                                View Audit Trail
                            </button>
                        </div>
                    }
                />

                <DepositAmendForm
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    setDepositTransaction={setDepositTransaction}
                    onClearFileComponent={onClearFileComponent}
                    setOnClearToFalse={setOnClearFileComponent}
                    depositTransaction={depositTransaction}
                    handleAmountChange={handleAmountChange}
                    handleDateChange={handleDateChange}
                    handleSave={handleSaveAndUpdate}
                    handleSubmit={handleSubmit}
                    _loading={loading}
                    _loadingSave={loadingSave}
                    editAccount={editAccount}
                    handleSourceChange={handleSourceChange}
                    selectedClientProfile={selectedClientProfile}
                    selectedClientAccount={selectedClientAccount}
                    switchAccount={switchAccount}
                    setSwitchAccount={setSwitchAccount}
                    clientAccountOptions={clientAccountOptions}
                    clientOptions={clientOptions}
                    clientAccountOptionsForAccount={clientAccountOptionsForAccount}
                    handleClientAccountChange={handleClientAccountChange}
                    selectedAccount={`${depositTransaction.accountNumber} ${getClientName(depositTransaction.entityNumber)}`}
                    showOtherSource={showOtherSource}
                    handleReAllocate={handleReAllocate}
                    onCancel={onCancel} />
            </div>
        </ErrorBoundary >
    )
})