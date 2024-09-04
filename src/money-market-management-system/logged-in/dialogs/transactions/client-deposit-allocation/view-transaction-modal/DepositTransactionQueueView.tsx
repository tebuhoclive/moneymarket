import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
// import { useAppContext } from "../../../../../../shared/functions/Context";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { getMMADocId } from "../../../../../../shared/functions/MyFunctions";

import MODAL_NAMES from "../../../ModalName";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";

import { ClientDepositAllocationAuditTrailGrid } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";
import { useAppContext } from "../../../../../../shared/functions/Context";
import NormalClientStatement from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";

interface IProps {
    setShowOnAmendModal?: (value: boolean) => void;
}


const DepositTransactionQueueView = observer(({ setShowOnAmendModal }: IProps) => {
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Deposit");
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const auditTrail = store.depositTransactionAudit.all;
    const accountDocId = getMMADocId(depositTransaction.accountNumber, store) || "";

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];

    const mmAccounts = store.mma.all;

    const getClientName = (transaction: IDepositTransaction) => {
        const account = mmAccounts.find(
            (account) => account.asJson.accountNumber === transaction.accountNumber
        );
        if (account && transaction.entityNumber !=="") {
            const client = clients.find(
                (client) => client.asJson.entityId === account.asJson.parentEntity
            );
            if (client) {
                const clientName = client.asJson.entityDisplayName;
                return clientName;
            }
        } else {
            return "";
        }
    };

    const allocationDetails: IDataDisplay[] = [
        { label: 'Client Name', value: `${depositTransaction.entityNumber}-${getClientName(depositTransaction)}` },
        { label: 'Account No.', value: depositTransaction.accountNumber },
        { label: 'Client Email', value: depositTransaction?.emailAddress ??"" } //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [
        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.valueDate) },
        { label: 'Statement Reference', value: depositTransaction.bankReference },
        { label: 'Amount', value: depositTransaction.amount },
        // { label: 'Return Note', value: depositTransaction?.note ??"" },
        { label: 'Reason For Back  Dated Transaction', value: depositTransaction?.reasonForBackDating ??"" },
        { label: 'Reason For Future Dated Transaction', value: depositTransaction?.reasonForFutureDating ??"" },
    ];
    const filteredDetails = transactionDetails.filter(detail => detail.value !== "");
    const depositTransactionAudit = auditTrail
        .sort((a, b) => {
            const dateA = new Date(a.asJson.auditDateTime || 0);
            const dateB = new Date(b.asJson.auditDateTime || 0);

            return dateB.getTime() - dateA.getTime();
        })
        .map((c) => {
            return c.asJson;
        });

    const onCancel = () => {
        store.depositTransaction.clearSelected();
        setDepositTransaction({ ...defaultDepositTransaction });
        hideModalFromId(
            MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL
        );
        setLoading(false);
    };
    // const moveToNonDeposit = async () => {
    //     setLoadingNonDeposit(true);
    //     const newDepositTransaction: IDepositTransaction = {
    //         ...depositTransaction,
    //         id: depositTransaction.id,
    //         transactionStatus: "Non-Deposit",
    //         createdAtTime: {
    //             nonDepositsQueue: Date.now(),
    //         },
    //         transactionAction: "Marked as a Non Deposit",
    //         bankValueDate: depositTransaction.bankValueDate || 0,
    //         bankTransactionDate: depositTransaction.bankTransactionDate || 0,
    //         parentTransaction: depositTransaction.parentTransaction || "",
    //     }
    //     try {
    //         await api.depositTransaction.update(newDepositTransaction)
    //         hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
    //         setLoadingNonDeposit(false)
    //     } catch (error) {
    //         setLoadingNonDeposit(false)
    //     }
    // }

    // const moveToUnAllocated = async () => {
    //     setLoadingUnallocated(true);
    //     const newDepositTransaction: IDepositTransaction = {
    //         ...depositTransaction,
    //         id: depositTransaction.id,
    //         transactionStatus: "Unallocated",
    //         transactionAction: "Marked as Un Allocated",
    //         createdAtTime: {
    //             nonDepositsQueue: Date.now(),
    //         },
    //         bankValueDate: depositTransaction.bankValueDate || 0,
    //         bankTransactionDate: depositTransaction.bankTransactionDate || 0,
    //         parentTransaction: depositTransaction.parentTransaction || "",
    //     }
    //     try {
    //         await api.depositTransaction.update(newDepositTransaction)
    //         hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
    //         setLoadingUnallocated(false)
    //     } catch (error) {
    //         setLoadingUnallocated(false)
    //     }
    // }

    // const submitForFirstLevelApproval = async () => {
    //     setLoadingSubmit(true)
    //     if (depositTransaction.accountNumber !== "") {
    //         const newDepositTransaction: IDepositTransaction = {
    //             ...depositTransaction,
    //             id: depositTransaction.id,
    //             transactionStatus: "First Level",
    //             createdAtTime: {
    //                 firstLevelQueue: Date.now(),
    //             },
    //             bankValueDate: depositTransaction.bankValueDate || 0,
    //             bankTransactionDate: depositTransaction.bankTransactionDate || 0,
    //             parentTransaction: depositTransaction.parentTransaction || "",
    //             transactionAction: "Submitted for First Level Approval",
    //             productCode: getMMAProduct(depositTransaction.accountNumber, store),
    //             capturedBy: store.auth.meUID || ""
    //         }
    //         try {
    //             await api.depositTransaction.update(newDepositTransaction)
    //             hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
    //             setLoadingSubmit(false)
    //         } catch (error) {
    //             setLoadingSubmit(false);
    //         }
    //         setLoadingSubmit(false);
    //     } else {
    //         swal({
    //             title: "Oops",
    //             text: "Transaction is un allocated",
    //             icon: "warning"
    //         })
    //         setLoadingSubmit(false);
    //     }

    // }

    // const onAmend = () => {
    //     if (setShowOnAmendModal) {
    //         setShowOnAmendModal(true);
    //         showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.WITHDRAWAL_AMEND_MODAL);
    //     }
    // }
    useEffect(() => {
        if (store.depositTransaction.selected) {
            setDepositTransaction(store.depositTransaction.selected);
        }
    }, [store.depositTransaction.selected]);
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

    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
                <button className="uk-modal-close-default" onClick={onCancel} disabled={loading} type="button" data-uk-close></button>
                <div className="form-title">
                    <h3 style={{ marginRight: "1rem" }}>
                        DEPOSIT
                    </h3>
                    <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                    <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                        {depositTransaction.transactionStatus} Transaction View
                    </h3>
                </div>
                <hr />
                <div className="uk-text-right uk-margin-bottom">
                    <button className={`btn ${selectedTab === "Deposit" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Deposit")}>
                        Deposit
                    </button>
                    <button className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit-Trail")}>
                        Audit Trail
                    </button>
                    <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
                        View Statement
                    </button>
                </div>

                <div className="dialog-content uk-position-relative uk-flex uk-flex-column uk-flex-nowrap uk-width-auto uk-height-auto">
                {
                        selectedTab === "Deposit" &&
                        <div className="uk-grid uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-2 k-margin-small-top">
                                <DetailView dataToDisplay={filteredDetails} />
                                <DetailView dataToDisplay={allocationDetails} />
                            </div>
                            <div className="uk-width-1-2">
                                {depositTransaction?.sourceOfFundsAttachment?.url && (
                                    <>
                                        <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                                            <label className="uk-form-label" htmlFor="fileToAttach">
                                                Attached Source of Funds
                                            </label>
                                            <div className="uk-margin-top uk-margin-bottom">
                                                <a
                                                    className="btn btn-primary"
                                                    href={depositTransaction?.sourceOfFundsAttachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {depositTransaction?.sourceOfFundsAttachment?.reasonForNotAttaching && !depositTransaction.sourceOfFundsAttachment.url && (
                                    <>
                                        <div className="uk-form-controls">
                                            <label className="uk-form-label" htmlFor="">
                                                Reason for not attaching Source of Funds
                                            </label>
                                            <textarea
                                                cols={60}
                                                rows={2}
                                                disabled
                                                required
                                                value={depositTransaction.sourceOfFundsAttachment.reasonForNotAttaching}
                                            ></textarea>
                                        </div>
                                    </>
                                )}
                                {depositTransaction?.proofOfPaymentAttachment?.url && (
                                    <>
                                        <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                                            <label className="uk-form-label" htmlFor="fileToAttach">
                                                Attached Proof of Payment
                                            </label>
                                            <div className="uk-margin-top uk-margin-bottom">
                                                <a
                                                    className="btn btn-primary"
                                                    href={depositTransaction.proofOfPaymentAttachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {depositTransaction?.proofOfPaymentAttachment?.reasonForNotAttaching && !depositTransaction.proofOfPaymentAttachment.url && (
                                    <>
                                        <div className="uk-form-controls">
                                            <label className="uk-form-label" htmlFor="">
                                                Reason for not attaching Proof of Payment
                                            </label>
                                            <textarea
                                                cols={60}
                                                rows={2}
                                                disabled
                                                required
                                                value={depositTransaction.proofOfPaymentAttachment.reasonForNotAttaching}
                                            ></textarea>
                                        </div>
                                    </>
                                )}
                                     {
                                        depositTransaction.note &&
                                        <div>
                                            <label className="uk-form-label">Return Note:</label>
                                            <textarea
                                                value={depositTransaction.note}
                                                cols={5}
                                                required
                                                disabled
                                            />
                                        </div >
                                    }
                            </div>
                        </div>
                    }
                    {selectedTab === "Audit-Trail" && (
                        <ClientDepositAllocationAuditTrailGrid
                            data={depositTransactionAudit}
                        />
                    )}
                    {selectedTab === "Statement" && (
                        <NormalClientStatement noButtons={true} moneyMarketAccountId={accountDocId} />
                    )}
                </div>
            </div >
        </ErrorBoundary >
    );
});

export default DepositTransactionQueueView;