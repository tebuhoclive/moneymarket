import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { toJS } from 'mobx'
import swal from "sweetalert";
import { useAppContext } from '../../../../../../shared/functions/Context';
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel';
import { IMoneyMarketAccount } from '../../../../../../shared/models/money-market-account/MoneyMarketAccount';
import { hideModalFromId } from '../../../../../../shared/functions/ModalShow';
import MODAL_NAMES from '../../../ModalName';
import { splitAndTrimString } from '../../../../../../shared/functions/StringFunctions';
import DetailView, { IDataDisplay } from '../../../../shared/components/detail-view/DetailView';
import { currencyFormat } from '../../../../../../shared/functions/Directives';
import { dateFormat_DD_MM_YY } from '../../../../../../shared/utils/utils';
import { ClientWithdrawalAuditTrailView } from '../../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView';
import NormalClientStatement from '../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement';
import { getMMADocId } from '../../../../../../shared/functions/MyFunctions';

const DeleteManualWithdrawalForAmendment = observer(() => {
    const { store, api } = useAppContext();
    const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction })
    const [loading, setLoading] = useState(false);
    const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();

    const [selectedTab, setSelectedTab] = useState("Withdrawal");
    const accountDocId = getMMADocId(withdrawalTransaction.accountNumber, store) || "";

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];
    const mmAccounts = store.mma.all;

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

    const handleDelete = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const newWithdrawalTransaction: IWithdrawalTransaction = {
            id: withdrawalTransaction.id,
            transactionStatus: "First Level",
            createdAtTime: {
                firstLevelQueue: Date.now(),
            },
            reasonForDeleting: withdrawalTransaction.reasonForDeleting,
            parentTransaction: withdrawalTransaction.parentTransaction || "",
            allocationStatus: "Submitted for Deletion",
            transactionAction: "Submitted for First Level Approval",
            transactionDate: withdrawalTransaction.transactionDate,
            valueDate: withdrawalTransaction.valueDate,
            amount: withdrawalTransaction.amount,
            accountNumber: withdrawalTransaction.accountNumber,
            productCode: withdrawalTransaction.productCode,
            entityNumber: withdrawalTransaction.entityNumber,
            clientBankingDetails: withdrawalTransaction.clientBankingDetails,
            bankReference: withdrawalTransaction.bankReference,
            clientInstruction: {
                url: withdrawalTransaction.clientInstruction.url,
                reasonForNotAttaching: withdrawalTransaction.clientInstruction.reasonForNotAttaching
            },
            sourceOfFundsAttachment: {
                url: withdrawalTransaction.sourceOfFundsAttachment.url,
                reasonForNotAttaching: withdrawalTransaction.sourceOfFundsAttachment.reasonForNotAttaching
            },
            sourceOfFunds: withdrawalTransaction.sourceOfFunds,
            withdrawalNodeType: 'Parent',
            transactionIdentifier: '',
            transactionType: withdrawalTransaction.transactionType,
            withdrawalTransactionProcess: withdrawalTransaction.withdrawalTransactionProcess,
            description: withdrawalTransaction.description
        }
        try {
            await api.withdrawalTransaction.update(newWithdrawalTransaction)
            swal({
                icon: "success",
                text:
                    "Transaction Successfully Submitted for approval",
            });
            hideModalFromId(MODAL_NAMES.BACK_OFFICE.DELETE_WITHDRAWAL_TRANSACTION_MODAL);
            onCancel()
        } catch (error) {
        }
    }
    
    useEffect(() => {
        if (store.withdrawalTransaction.selected) {
            const withdrawalTransactionJson = toJS(store.withdrawalTransaction.selected);
            setWithdrawalTransaction(withdrawalTransactionJson)
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
        } else {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.withdrawalTransaction.selected])

    const onCancel = () => {
        setLoading(false);
        store.withdrawalTransaction.clearSelected();
        setWithdrawalTransaction({ ...defaultWithdrawalTransaction })
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.DELETE_WITHDRAWAL_TRANSACTION_MODAL);
    }


    const modalTitle = () => {
        switch (withdrawalTransaction.withdrawalTransactionProcess) {
            case "Back-Dated":
                return "DELETE BACK DATED WITHDRAWAL TRANSACTION VIEW"
            case "Future-Dated":
                return "DELETE FUTURE DATED WITHDRAWAL TRANSACTION VIEW"
            case "Normal":
                return "DELETE WITHDRAWAL TRANSACTION VIEW"
            default:
                return "DELETE WITHDRAWAL TRANSACTION VIEW";
        }
    }
    return (
        <div className="custom-modal-style uk-modal-dialog uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close></button>

            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>
                    WITHDRAWALS TRANSACTIONS
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt='' />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    {modalTitle()}
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

            <form className='ijg-form' onSubmit={handleDelete}>
                <div className="dialog-content uk-position-relative">
                    {
                        selectedTab === "Withdrawal" &&
                        <div className="uk-grid" data-uk-grid>
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
                                <div>
                                    <label className="uk-form-label uk-display-block required">Reason For Deleting Transaction :</label>
                                    <textarea
                                        className="uk-form-small"
                                        value={withdrawalTransaction.reasonForDeleting}
                                        onChange={(e) => setWithdrawalTransaction({ ...withdrawalTransaction, reasonForDeleting: e.target.value })}
                                        placeholder="Please provide a reason"
                                        required
                                    />
                                </div>

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
                    <button type='button' className='btn btn-danger' disabled={loading} onClick={onCancel}>Cancel</button>
                    <button type='submit' className='btn btn-primary' disabled={loading}> {loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Delete"}</button>
                </div>
            </form>
        </div>
    )
})

export default DeleteManualWithdrawalForAmendment
