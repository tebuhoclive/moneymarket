import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../../../../shared/functions/Context";
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from "../../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { getMMADocId } from "../../../../../../../../shared/functions/MyFunctions";
import DetailView, { IDataDisplay } from "../../../../../../shared/components/detail-view/DetailView";
import MODAL_NAMES from "../../../../../../dialogs/ModalName";
import { hideModalFromId } from "../../../../../../../../shared/functions/ModalShow";
import ErrorBoundary from "../../../../../../../../shared/components/error-boundary/ErrorBoundary";
import NormalClientStatement from "../../../../../money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
import { splitAndTrimString } from "../../../../../../../../shared/functions/StringFunctions";
import { IMoneyMarketAccount } from "../../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { ClientWithdrawalAuditTrailView } from "../../../../bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView";
import { currencyFormat } from "../../../../../../../../shared/functions/Directives";
import { dateFormat_DD_MM_YY } from "../../../../../../../../shared/utils/utils";

const WithdrawalCompleteView = observer(() => {
    const [selectedTab, setSelectedTab] = useState("Withdrawal");
    const { api, store } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction });
    const accountDocId = getMMADocId(withdrawalTransaction.accountNumber, store) || "";

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];
    const mmAccounts = store.mma.all;

    const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();

    const allocationDetails: IDataDisplay[] = [
        { label: 'Client Name', value: selectedClientAccount?.accountName || "-" },
        { label: 'Account Number', value: withdrawalTransaction.accountNumber || "-" },
        { label: 'Product Code', value: withdrawalTransaction.productCode || "-" },
        { label: 'Email', value: withdrawalTransaction.emailAddress || "-" },
        { label: 'Remaining Balance', value: currencyFormat(selectedClientAccount?.balance || 0) }
    ];

    const transactionDetails: IDataDisplay[] = [
        { label: 'Transaction Type', value: withdrawalTransaction.transactionType },
        { label: 'Bank Reference', value: withdrawalTransaction.bankReference },
        { label: 'Value Date', value: dateFormat_DD_MM_YY(withdrawalTransaction.valueDate) },
        { label: 'Transaction Date', value: dateFormat_DD_MM_YY(withdrawalTransaction.transactionDate) },
        { label: 'Withdrawal Amount', value: currencyFormat(withdrawalTransaction.amount) || 0 },
        { label: 'BOP Code', value: withdrawalTransaction.balanceOfPaymentCodes || "-" },
    ]

    const bankingDetails: IDataDisplay[] = [
        { label: 'Bank Acc Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[2] || "-" },
        { label: 'Bank Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[0] || "-" },
        { label: 'Bank Acc Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[1] || "-" },
        { label: 'Bank Branch Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[3] || "-" },
    ];

    const filteredDetails = bankingDetails.filter(detail => detail.value !== "");

    const auditTrail = store.withdrawalTransactionAudit.all;

    const withdrawalTransactionAudit = auditTrail.sort((a, b) => {
        const dateA = new Date(a.asJson.auditDateTime || 0);
        const dateB = new Date(b.asJson.auditDateTime || 0);
        return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });


    const onCancel = () => {
        store.withdrawalTransaction.clearSelected();
        setWithdrawalTransaction({ ...defaultWithdrawalTransaction });
        hideModalFromId(
            MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW
        );
        setLoading(false);
    };

    useEffect(() => {
        if (store.withdrawalTransaction.selected) {
            setWithdrawalTransaction(store.withdrawalTransaction.selected);

            const account = mmAccounts.find(
                account => account.asJson.accountNumber === store.withdrawalTransaction.selected?.accountNumber
            );
            if (account) {
                const client = clients.find(client => client.asJson.entityId === account.asJson.parentEntity);
                if (client) {
                    setSelectedClientAccount(account.asJson);
                } else {
                }
            } else {
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.withdrawalTransaction.selected]);

    useEffect(() => {
        const loadData = async () => {
            if (withdrawalTransaction.id) {
                await api.withdrawalTransactionAudit.getAll(withdrawalTransaction.id);
            }
        };
        loadData();
    }, [api.withdrawalTransactionAudit, withdrawalTransaction.id]);

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
                        {withdrawalTransaction.transactionStatus} Transaction View
                    </h3>
                </div>
                <hr />
                <div className="uk-text-right uk-margin-bottom">
                    <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
                        Withdrawal Details
                    </button>
                    <button className={`btn ${selectedTab === "Audit-Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit-Trail")}>
                        Audit Trail
                    </button>
                    <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
                        View Statement
                    </button>
                </div>

                <div className="dialog-content uk-position-relative">
                    {
                        selectedTab === "Withdrawal" &&
                        <div className="uk-grid uk-grid-small" data-uk-grid>
                            <div className="uk-width-1-2 k-margin-small-top">
                                <DetailView dataToDisplay={allocationDetails} />
                                <DetailView dataToDisplay={filteredDetails} />
                            </div>
                            <div className="uk-width-1-2">
                                <DetailView dataToDisplay={transactionDetails} />
                                {withdrawalTransaction?.sourceOfFundsAttachment?.url && (
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
                                    <div className="uk-form-controls uk-width-1-1 uk-margin-top">
                                        <label className="uk-form-label" htmlFor="fileToAttach">
                                            Attached Instruction
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
                                )}
                                {withdrawalTransaction?.clientInstruction?.reasonForNotAttaching && !withdrawalTransaction.clientInstruction.url && (
                                    <div className="uk-form-controls">
                                        <label className="uk-form-label" htmlFor="">
                                            Reason for not attaching Instruction
                                        </label>
                                        <textarea
                                            cols={60}
                                            rows={2}
                                            disabled
                                            required
                                            value={withdrawalTransaction.clientInstruction.reasonForNotAttaching}
                                        ></textarea>
                                    </div>
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

                    {selectedTab === "Audit-Trail" &&
                        <ClientWithdrawalAuditTrailView data={withdrawalTransactionAudit} />
                    }
                    {selectedTab === "Statement" &&
                        <NormalClientStatement noButtons={true} moneyMarketAccountId={accountDocId} />
                    }

                </div>
                <div className="uk-text-right">
                    <button className="btn btn-danger" disabled={loading} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div >
        </ErrorBoundary >
    );
});

export default WithdrawalCompleteView;