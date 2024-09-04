import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../../../../../../../shared/functions/Context'
import { hideModalFromId } from '../../../../../../../../shared/functions/ModalShow'
import MODAL_NAMES from '../../../../../ModalName'
import DetailView, { IDataDisplay } from '../../../../../../shared/components/detail-view/DetailView'
import { defaultWithdrawalTransaction, IWithdrawalTransaction } from '../../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel'
import { splitAndTrimString } from '../../../../../../../../shared/functions/StringFunctions'
import { IMoneyMarketAccount } from '../../../../../../../../shared/models/money-market-account/MoneyMarketAccount'
import { currencyFormat } from '../../../../../../../../shared/functions/Directives'
import NormalClientStatement from '../../../../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement'
import { ClientWithdrawalAuditTrailView } from '../../../../../../system-modules/money-market-transactions-module/bank-statement-upload/transaction-status/ClientWithdrawalAuditTrailView'

const ReturnWithdrawalForAmendment = observer(() => {
    const { store, api } = useAppContext();
    const [withdrawalTransaction, setWithdrawalTransaction] = useState<IWithdrawalTransaction>({ ...defaultWithdrawalTransaction })
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Withdrawal");

    const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();

    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
    ];

    const mmAccounts = store.mma.all;

    const auditTrail = store.withdrawalTransactionAudit.all;

    const withdrawalTransactionAudit = auditTrail.sort((a, b) => {
        const dateA = new Date(a.asJson.auditDateTime || 0);
        const dateB = new Date(b.asJson.auditDateTime || 0);
        return dateB.getTime() - dateA.getTime();
    }).map((c) => { return c.asJson });

    const handleReturn = async (e: any) => {
        alert("here")
        e.preventDefault();
        setLoading(true);
        const newWithdrawalTransaction: IWithdrawalTransaction = {
            ...withdrawalTransaction,
            transactionStatus: "Draft",
            createdAtTime: {
                transactionQueue: Date.now(),
            },
            note: withdrawalTransaction.note || "",
            allocationStatus: "Returned for Amendment",
            transactionAction: "Returned for Amendment",
        }
        try {
            await api.withdrawalTransaction.returnForAmendment(withdrawalTransaction, newWithdrawalTransaction);
        } catch (error) {
            alert(error)
        }
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
        setLoading(false)
    }

    useEffect(() => {
        if (store.withdrawalTransaction.selected) {
            const withdrawalTransaction = store.withdrawalTransaction.selected;
            setWithdrawalTransaction(withdrawalTransaction)
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
        setLoading(false)
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
    }
    const balance = selectedClientAccount?.balance || 0;
    const allocationDetails: IDataDisplay[] = [
        { label: 'Client Name', value: selectedClientAccount?.accountName || "-" },
        { label: 'Product Code', value: selectedClientAccount?.accountType || "-" },
        { label: 'Account Balance', value: currencyFormat(balance || 0) },
        { label: 'Withdrawal Amount', value: currencyFormat(withdrawalTransaction.amount || 0) },
        { label: 'Remaining Balance', value: balance - withdrawalTransaction.amount || 0 }
    ];
    const transactionDetails: IDataDisplay[] = [
        { label: 'Bank Acc Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[2] || "-" },
        { label: 'Bank Name', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[0] || "-" },
        { label: 'Bank Acc Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[1] || "-" },
        { label: 'Bank Branch Number', value: splitAndTrimString('|', withdrawalTransaction.clientBankingDetails)[3] || "-" },
    ];


    useEffect(() => {
        const loadData = async () => {
            if (withdrawalTransaction.id) {
                await api.withdrawalTransactionAudit.getAll(withdrawalTransaction.id);
            }
        };
        loadData();
    }, [api.withdrawalTransactionAudit, withdrawalTransaction.id]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-width-4-5">
            <button
                className="uk-modal-close-default"
                // onClick={onCancel}
                // disabled={loading || loadingSave}
                type="button"
                data-uk-close></button>

            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>
                    WITHDRAWALS TRANSACTIONS
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt='' />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    Return For Amendment
                </h3>
            </div>
            <hr />
            <div className="uk-text-right uk-margin-bottom">
                <button className={`btn ${selectedTab === "Withdrawal" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Withdrawal")}>
                    Withdrawal
                </button>

                <button
                    className={`btn ${selectedTab === "Audit Trail" ? "btn-primary" : "btn-primary-in-active"}`}
                    onClick={() => setSelectedTab("Audit Trail")}
                >
                    View Audit Trail
                </button>
                <button
                    className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`}
                    onClick={() => setSelectedTab("Statement")}
                >
                    View Statement
                </button>
            </div>


            <form className='ijg-form' onSubmit={handleReturn}>
                <div className="dialog-content uk-position-relative">
                    {
                        selectedTab === "Withdrawal" &&
                        <div className="uk-grid uk-grid-small" data-uk-grid>
                            <div className="uk-width-expand">
                                <DetailView dataToDisplay={allocationDetails} />
                            </div>
                            <div className="uk-width-1-2">
                                <DetailView dataToDisplay={transactionDetails} />
                                <label className="uk-form-label uk-display-block required">Return Note</label>
                                <textarea
                                    className="uk-form-small"
                                    value={withdrawalTransaction.note}
                                    onChange={(e) => setWithdrawalTransaction({ ...withdrawalTransaction, note: e.target.value })}
                                    placeholder="Please provide a reason"
                                    required
                                />
                            </div>
                        </div>
                    }
                    {selectedTab === "Statement" &&
                        <>
                            {
                                !loading && selectedClientAccount &&
                                <NormalClientStatement moneyMarketAccountId={selectedClientAccount.id} noButtons={true} />
                            }
                        </>
                    }
                    {selectedTab === "Audit Trail" &&
                        <ClientWithdrawalAuditTrailView data={withdrawalTransactionAudit} />
                    }





                </div>
                {
                    selectedTab === "Withdrawal" &&
                    <div className="uk-text-right">
                        <button type='button' className='btn btn-danger' disabled={loading} onClick={onCancel}>Cancel</button>
                        <button type='submit' className='btn btn-primary' disabled={loading}> {loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Return"}</button>
                    </div>
                }

            </form>
        </div>
    )
})

export default ReturnWithdrawalForAmendment
