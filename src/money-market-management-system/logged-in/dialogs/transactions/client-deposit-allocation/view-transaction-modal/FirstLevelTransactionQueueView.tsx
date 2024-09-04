import { useEffect, useState } from "react";
import swal from "sweetalert";
import { observer } from "mobx-react-lite";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { getMMADocId, getMMAProduct } from "../../../../../../shared/functions/MyFunctions";
import showModalFromId, { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
import NormalClientStatement from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { ClientDepositAllocationAuditTrailGrid } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";
import { useAppContext } from "../../../../../../shared/functions/Context";

const FirstLevelTransactionQueueView = observer(() => {
    const [selectedTab, setSelectedTab] = useState("Deposit");
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const auditTrail = store.depositTransactionAudit.all;
    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];
    const mmAccounts = store.mma.all;
    const accountDocId = getMMADocId(depositTransaction.accountNumber, store) || "";
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
        { label: 'Client Email', value: depositTransaction.emailAddress ??"" } //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [

        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.valueDate) },
        { label: 'Statement Reference', value: depositTransaction.bankReference },
        { label: 'Amount', value: depositTransaction.amount },
        // { label: 'Return Note', value: depositTransaction.note ??"" },
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
            MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL
        );
        setLoading(false);
    };



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

    // Main operations
    const submitForSecondLevelApproval = async () => {
        setLoading(true)
        if (depositTransaction.accountNumber !== "") {
            const newDepositTransaction: IDepositTransaction = {
                ...depositTransaction,
                id: depositTransaction.id,
                transactionStatus: "Second Level",
                createdAtTime: {
                    secondLevelQueue: Date.now(),
                },
                transactionAction: "Approved First Level",
                bankValueDate: depositTransaction.bankValueDate || 0,
                bankTransactionDate: depositTransaction.bankTransactionDate || 0,
                parentTransaction: depositTransaction.parentTransaction || "",
                productCode: getMMAProduct(depositTransaction.accountNumber, store),
                firstLevelApprover: store.auth.meUID || "",
                note: depositTransaction.note
            }
            try {
                await api.depositTransaction.update(newDepositTransaction);
                hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL);
                setLoading(false)
                console.log("Deposit transaction ",newDepositTransaction)
            } catch (error) {

            }
            setLoading(true);
        } else {
            swal({
                title: "Oops",
                text: "Transaction is un allocated",
                icon: "danger"
            })
        }

    }

    const onReturnForAmendment = () => {
        showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
    }
    // Main operations
    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-width-4-5">

                <button
                    className="uk-modal-close-default"
                    onClick={onCancel}
                    disabled={loading}
                    type="button"
                    data-uk-close></button>
                <div className="form-title">
                    <h3 style={{ marginRight: "1rem" }}>
                        DEPOSIT
                    </h3>
                    <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                    <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                        {depositTransaction.transactionStatus} Approval Transaction View
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
                                                    href={depositTransaction.sourceOfFundsAttachment.url}
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

                <div className="uk-text-right">
                    <button className="btn btn-danger" disabled={loading} onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" disabled={loading} onClick={onReturnForAmendment}>Return for amendment</button>
                    <button className="btn btn-primary" disabled={loading} onClick={submitForSecondLevelApproval}>{loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Submit Transaction"} </button>
                </div>
            </div >
        </ErrorBoundary >
    );
});

export default FirstLevelTransactionQueueView;