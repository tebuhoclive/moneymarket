import { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { getMMADocId } from "../../../../../../../../shared/functions/MyFunctions";
import DetailView, { IDataDisplay } from "../../../../../../shared/components/detail-view/DetailView";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../../../shared/utils/utils";
import MODAL_NAMES from "../../../../../../dialogs/ModalName";
import showModalFromId, { hideModalFromId } from "../../../../../../../../shared/functions/ModalShow";
import ErrorBoundary from "../../../../../../../../shared/components/error-boundary/ErrorBoundary";
import NormalClientStatement from "../../../../../money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { ClientWithdrawalAuditTrailView } from "../../../../bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
// import { useAppContext } from "../../../../../../shared/functions/Context";

const PaymentWithdrawalTransactionQueueView = observer(() => {
    const [selectedTab, setSelectedTab] = useState("Deposit");
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
    const accountDocId = getMMADocId(withdrawalTransaction.accountNumber, store) || "";

    const auditTrail = store.withdrawalTransactionAudit.all;
    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];

    const mmAccounts = store.mma.all;
    const onReturnForAmendment = () => {
        showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
    }
    const getClientName = (transaction: IWithdrawalTransaction) => {
        const account = mmAccounts.find(
            (account) => account.asJson.accountNumber === transaction.accountNumber
        );
        if (account && transaction.entityNumber !== "") {
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
        { label: 'Client Name', value: `${withdrawalTransaction.entityNumber}-${getClientName(withdrawalTransaction)}` },
        { label: 'Account No.', value: withdrawalTransaction.accountNumber },
        { label: 'Client Email', value: withdrawalTransaction?.emailAddress ?? "" } //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [

        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(withdrawalTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(withdrawalTransaction.valueDate) },
        { label: 'Statement Reference', value: withdrawalTransaction.bankReference },
        { label: 'Amount', value: withdrawalTransaction.amount },
        // { label: 'Return Note', value: withdrawalTransaction?.note??"" },
        // { label: 'Reason For Back  Dated Transaction', value: withdrawalTransaction?.reasonForBackDating ??"" },
        // { label: 'Reason For Future Dated Transaction', value: withdrawalTransaction?.reasonForFutureDating ??"" },

    ];
    const filteredDetails = transactionDetails.filter(detail => detail.value !== "");

    const withdrawalTransactionAudit = auditTrail
        .sort((a, b) => {
            const dateA = new Date(a.asJson.auditDateTime || 0);
            const dateB = new Date(b.asJson.auditDateTime || 0);

            return dateB.getTime() - dateA.getTime();
        })
        .map((c) => {
            return c.asJson;
        });

    const onCancel = () => {
        store.withdrawalTransaction.clearSelected();
        setWithdrawalTransaction({ ...defaultWithdrawalTransaction });
        hideModalFromId(
            MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW
        );
        setLoading(false);
    };

    console.log("My Deposit Transaction in completed view ", withdrawalTransaction)
    useEffect(() => {
        if (store.withdrawalTransaction.selected) {
            setWithdrawalTransaction(store.withdrawalTransaction.selected);
        }
    }, [store.withdrawalTransaction.selected]);

    useEffect(() => {
        const loadData = async () => {
            if (withdrawalTransaction.id) {
                await api.withdrawalTransactionAudit.getAll(
                    withdrawalTransaction.id
                );
            }
        };
        loadData();
    }, [api.withdrawalTransactionAudit, api.user, withdrawalTransaction.id]);

    return (
        <ErrorBoundary>
            <div className="view-modal custom-modal-style uk-modal-dialog uk-width-4-5">
                <button className="uk-modal-close-default" onClick={onCancel} disabled={loading} type="button" data-uk-close></button>
                <div className="form-title">
                    <h3 style={{ marginRight: "1rem" }}>
                        WITHDRAWAL
                    </h3>
                    <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                    <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                        {withdrawalTransaction.transactionStatus} Transaction Views
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
                                {withdrawalTransaction?.sourceOfFundsAttachment?.url && (
                                    <>
                                        <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                                            <label className="uk-form-label" htmlFor="fileToAttach">
                                                Attached Source of Funds
                                            </label>
                                            <div className="uk-margin-top uk-margin-bottom">
                                                <a
                                                    className="btn btn-primary"
                                                    href={withdrawalTransaction.sourceOfFundsAttachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {withdrawalTransaction?.sourceOfFundsAttachment?.reasonForNotAttaching && !withdrawalTransaction.sourceOfFundsAttachment.url && (
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
                                                value={withdrawalTransaction.sourceOfFundsAttachment.reasonForNotAttaching}
                                            ></textarea>
                                        </div>
                                    </>
                                )}
                                {withdrawalTransaction?.clientInstruction?.url && (
                                    <>
                                        <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                                            <label className="uk-form-label" htmlFor="fileToAttach">
                                                Attached Proof of Payment
                                            </label>
                                            <div className="uk-margin-top uk-margin-bottom">
                                                <a
                                                    className="btn btn-primary"
                                                    href={withdrawalTransaction.clientInstruction.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View File
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {withdrawalTransaction?.clientInstruction?.reasonForNotAttaching && !withdrawalTransaction.clientInstruction.url && (
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
                                                value={withdrawalTransaction.clientInstruction.reasonForNotAttaching}
                                            ></textarea>
                                        </div>
                                    </>
                                )}
                                {
                                    withdrawalTransaction.note &&
                                    <div>
                                        <label className="uk-form-label">Return Note:</label>
                                        <textarea
                                            value={withdrawalTransaction.note}
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
                        <ClientWithdrawalAuditTrailView data={withdrawalTransactionAudit} />
                    )}
                    {selectedTab === "Statement" && (
                        <NormalClientStatement noButtons={true} moneyMarketAccountId={accountDocId} />
                    )}

                </div>
                <div className="uk-text-right">
                    <button className="btn btn-danger" disabled={loading} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" disabled={loading} onClick={onReturnForAmendment}>Return for amendment</button>
                    <button className="btn btn-primary" disabled={loading} >
                        Return for Amendment
                    </button>
                </div>
            </div >
        </ErrorBoundary >
    );
});

export default PaymentWithdrawalTransactionQueueView; 