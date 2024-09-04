import { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";
// import { useAppContext } from "../../../../../../shared/functions/Context";
import { IDepositTransaction, defaultDepositTransaction } from "../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import { getMMADocId } from "../../../../../../shared/functions/MyFunctions";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../../ModalName";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../../shared/utils/utils";
import NormalClientStatement from "../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { ClientDepositAllocationAuditTrailGrid } from "../../../../system-modules/money-market-transactions-module/bank-statement-upload/ClientDepositAllocationAuditTrailGrid";
import DetailView, { IDataDisplay } from "../../../../shared/components/detail-view/DetailView";
import { useAppContext } from "../../../../../../shared/functions/Context";

const CompletedTransactionQueueView = observer(() => {
    const [selectedTab, setSelectedTab] = useState("Deposit");
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction });
    const accountDocId = getMMADocId(depositTransaction.accountNumber, store) || "";

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
        { label: 'Client Name', value: `${depositTransaction.entityNumber}-${getClientName(depositTransaction)}` },
        { label: 'Account No.', value: depositTransaction.accountNumber },
        { label: 'Client Email', value: depositTransaction?.emailAddress ?? "" } //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [

        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.valueDate) },
        { label: 'Statement Reference', value: depositTransaction.bankReference },
        { label: 'Amount', value: depositTransaction.amount },
        // { label: 'Return Note', value: depositTransaction?.note??"" },
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

    return (
        <ErrorBoundary>
            <div className="view-modal custom-modal-style uk-modal-dialog uk-width-4-5">
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

            </div >
        </ErrorBoundary >
    );
});

export default CompletedTransactionQueueView;