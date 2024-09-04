import { useEffect, useState } from "react";
import swal from "sweetalert";
import { observer } from "mobx-react-lite";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { getMMAProduct } from "../../../../../../shared/functions/MyFunctions";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";

import { ClientDepositAllocationAuditTrailGrid } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";
import { useAppContext } from "../../../../../../shared/functions/Context";

import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";


const DepositTransactionQueueView = observer(() => {
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [loadingNonDeposit, setLoadingNonDeposit] = useState(false);
    const [loadingUnallocated, setLoadingUnallocated] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Audit-Trail");
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const auditTrail = store.depositTransactionAudit.all;

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];

    const mmAccounts = store.mma.all;

    const getClientName = (transaction: IDepositTransaction) => {
        const account = mmAccounts.find(
            (account) => account.asJson.accountNumber === transaction.accountNumber
        );
        if (account) {
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
        { label: 'Client Email', value: depositTransaction.emailAddress ?? "" } //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [

        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.valueDate) },
        { label: 'Statement Reference', value: depositTransaction.bankReference },
        { label: 'Amount', value: depositTransaction.amount },
        // { label: 'Return Note', value: depositTransaction.note??"" },
        { label: 'Reason For Back  Dated Transaction', value: depositTransaction?.reasonForBackDating ?? "" },
        { label: 'Reason For Future Dated Transaction', value: depositTransaction?.reasonForFutureDating ?? "" },
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
            MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.DEPOSIT_UNALLOCATED_TRANSACTION_VIEW
        );
        setLoading(false);
    };


    const moveToNonDeposit = async () => {
        setLoadingNonDeposit(true);
        const newDepositTransaction: IDepositTransaction = {
            ...depositTransaction,
            id: depositTransaction.id,
            transactionStatus: "Non-Deposit",
            createdAtTime: {
                nonDepositsQueue: Date.now(),
            },
            bankValueDate: depositTransaction.bankValueDate || 0,
            bankTransactionDate: depositTransaction.bankTransactionDate || 0,
            parentTransaction: depositTransaction.parentTransaction || "",
        }
        try {
            await api.depositTransaction.update(newDepositTransaction)
            hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
            setLoadingNonDeposit(false)
        } catch (error) {

        }
    }

    const moveToUnAllocated = async () => {
        setLoadingUnallocated(true);
        const newDepositTransaction: IDepositTransaction = {
            ...depositTransaction,
            id: depositTransaction.id,
            transactionStatus: "Unallocated",
            createdAtTime: {
                nonDepositsQueue: Date.now(),
            },
            bankValueDate: depositTransaction.bankValueDate || 0,
            bankTransactionDate: depositTransaction.bankTransactionDate || 0,
            parentTransaction: depositTransaction.parentTransaction || "",
        }
        try {
            await api.depositTransaction.update(newDepositTransaction)
            hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
            setLoadingUnallocated(false)
        } catch (error) {

        }
    }
    const submitForFirstLevelApproval = async () => {
        setLoadingSubmit(true)
        if (depositTransaction.accountNumber !== "") {
            const newDepositTransaction: IDepositTransaction = {
                ...depositTransaction,
                id: depositTransaction.id,
                transactionStatus: "First Level",
                createdAtTime: {
                    firstLevelQueue: Date.now(),
                },
                bankValueDate: depositTransaction.bankValueDate || 0,
                bankTransactionDate: depositTransaction.bankTransactionDate || 0,
                parentTransaction: depositTransaction.parentTransaction || "",
                productCode: getMMAProduct(depositTransaction.accountNumber, store),
                capturedBy: store.auth.meUID || ""
            }
            try {
                await api.depositTransaction.update(newDepositTransaction)
                hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
                setLoadingSubmit(false)
            } catch (error) {

            }
            setLoadingSubmit(true);
        } else {
            swal({
                title: "Oops",
                text: "Transaction is un allocated",
                icon: "danger"
            })
        }

    }


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
            <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-1" style={{ maxWidth: "800px" }}>
                <>
                    {" "}
                    <button
                        className="uk-modal-close-default"
                        onClick={onCancel}
                        disabled={loading}
                        type="button"
                        data-uk-close></button>
                    <div className="form-title">
                        <h3 style={{ marginRight: "1rem" }}>
                            DEPOSITS TRANSACTIONS
                        </h3>
                        <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                        <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                            TRANSACTION VIEW
                        </h3>
                    </div>
                    {depositTransaction.allocationStatus && (
                        <span className="" style={{ background: "grey", padding: "4px", borderRadius: "10px", color: "white", marginTop: "10px" }}>
                            {depositTransaction.allocationStatus}
                        </span>
                    )}
                    <div className="dialog-content uk-position-relative">
                        <div className="uk-grid">
                            <div className="uk-card uk-width-1-3">
                                <div className="uk-card-body">
                                    <h4 className="main-title-sm">Transaction Details</h4>
                                    <DetailView dataToDisplay={filteredDetails} />
                                    <br />
                                    <h4 className="main-title-sm">Allocation Details</h4>
                                    <DetailView dataToDisplay={allocationDetails} />
                                </div>
                            </div>
                            <div className="uk-card uk-card-body uk-width-2-3" >
                                <div className="uk-width-expand">
                                    <div
                                        className="uk-grid uk-width-1-1 uk-grid-small"
                                        data-uk-grid>
                                        <div className="uk-width-1-1" style={{ justifyContent: "end" }}>
                                            <div
                                                className="uk-margin-bottom"
                                                style={{ flex: "1", display: "flex", justifyContent: "start", gap: "1rem", marginLeft: "2rem" }}
                                            >
                                                <button
                                                    className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`}
                                                    onClick={() => setSelectedTab("Audit-Trail")}
                                                >
                                                    Audit Trail
                                                </button>
                                                <button
                                                    className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`}
                                                    onClick={() => setSelectedTab("Statement")}
                                                >
                                                    View Statement
                                                </button>
                                            </div>
                                            {selectedTab === "Audit-Trail" && (
                                                <ClientDepositAllocationAuditTrailGrid
                                                    data={depositTransactionAudit}
                                                />
                                            )}
                                            {selectedTab === "Statement" &&
                                                // <ShowClientStatementDeposit moneyMarketAccountId={depositTransaction.accountNumber} startDate={startDate} endDate={endDate} depositTransaction={depositTransaction} />)
                                                <></>
                                            }

                                        </div>
                                        <div className="uk-child-width-1-3@m uk-grid-small uk-grid-match" data-uk-grid>
                                            {depositTransaction?.sourceOfFundsAttachment?.url && (

                                                <div className="uk-form-controls">
                                                    <label className="uk-form-label" htmlFor="fileToAttach">
                                                        Attached Source of Funds
                                                    </label>
                                                    <div className="uk-margin-top uk-margin-bottom">
                                                        <a
                                                            className="btn btn-primary"
                                                            href={depositTransaction.sourceOfFundsAttachment.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View File
                                                        </a>
                                                    </div>
                                                </div>

                                            )}
                                            {depositTransaction?.sourceOfFundsAttachment?.reasonForNotAttaching && !depositTransaction.sourceOfFundsAttachment.url && (

                                                <div className="uk-form-controls">
                                                    <label className="uk-form-label" htmlFor="">
                                                        Reason for not attaching Source of Funds
                                                    </label>
                                                    <textarea
                                                        className="uk-textarea uk-form-small"
                                                        cols={60}
                                                        rows={5}
                                                        disabled
                                                        required
                                                        value={depositTransaction.sourceOfFundsAttachment.reasonForNotAttaching}
                                                    ></textarea>
                                                </div>

                                            )}
                                            {depositTransaction?.proofOfPaymentAttachment?.url && (

                                                <div className="uk-form-controls">
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

                                            )}
                                            {depositTransaction?.proofOfPaymentAttachment?.reasonForNotAttaching && !depositTransaction.proofOfPaymentAttachment.url && (

                                                <div className="uk-form-controls">
                                                    <label className="uk-form-label" htmlFor="">
                                                        Reason for not attaching Proof of Payment
                                                    </label>
                                                    <textarea
                                                        className="uk-textarea uk-form-small"
                                                        cols={60}
                                                        rows={5}
                                                        disabled
                                                        required
                                                        value={depositTransaction.proofOfPaymentAttachment.reasonForNotAttaching}
                                                    ></textarea>
                                                </div>

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
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "end", alignItems: "end", marginTop: "2rem" }}>
                    <button className="btn btn-danger" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={moveToNonDeposit}>{loadingNonDeposit ? <span data-uk-spinner={"ratio:.5"}></span> : "Move to Non Deposit"} </button>
                    <button className="btn btn-primary" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={moveToUnAllocated}> {loadingUnallocated ? <span data-uk-spinner={"ratio:.5"}></span> : "Move to Un-allocated"}</button>
                    <button className="btn btn-primary" disabled={loading || loadingNonDeposit || loadingSubmit || loadingUnallocated} onClick={submitForFirstLevelApproval}>{loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : "Submit Transaction"} </button>
                </div>
            </div >
        </ErrorBoundary >
    );
});

export default DepositTransactionQueueView;