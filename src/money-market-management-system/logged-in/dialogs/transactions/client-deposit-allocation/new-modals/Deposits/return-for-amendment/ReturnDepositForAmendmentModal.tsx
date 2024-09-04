import { observer } from 'mobx-react-lite'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { IDepositTransaction, defaultDepositTransaction } from '../../../../../../../../shared/models/deposit-transaction/DepositTransactionModel'
import { dateFormat_YY_MM_DD_NEW } from '../../../../../../../../shared/utils/utils'
import { useAppContext } from '../../../../../../../../shared/functions/Context'
import { hideModalFromId } from '../../../../../../../../shared/functions/ModalShow'
import MODAL_NAMES from '../../../../../ModalName'
import DetailView, { IDataDisplay } from '../../../../../../shared/components/detail-view/DetailView'

const ReturnDepositForAmendmentModal = observer(() => {
    const { store, api } = useAppContext();
    const [depositTransaction, setDepositTransaction] = useState<IDepositTransaction>({ ...defaultDepositTransaction })
    const [returnNote, setReturnNote] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const handleReasonChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setReturnNote(event.target.value);
    };
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
    const handleReturn = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const newDepositTransaction: IDepositTransaction = {
            ...depositTransaction,
            id: depositTransaction.id,
            transactionStatus: "Draft",
            createdAtTime: {
                transactionQueue: Date.now(),
            },
            note: returnNote,
            bankValueDate: depositTransaction.bankValueDate || 0,
            bankTransactionDate: depositTransaction.bankTransactionDate || 0,
            parentTransaction: depositTransaction.parentTransaction || "",
            allocationStatus: "Returned for Amendment",
            transactionAction: "Returned for Amendment",
        }
        try {
            await api.depositTransaction.update(newDepositTransaction)
            hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
            setLoading(false)
            setReturnNote("");
        } catch (error) {

        }
    }

    useEffect(() => {
        if (store.depositTransaction.selected) {
            setDepositTransaction(store.depositTransaction.selected)
        } else {

        }
    }, [store.depositTransaction.selected])



    const onCancel = () => {
        setLoading(false)
        setReturnNote("");
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL);
    }

    const allocationDetails: IDataDisplay[] = [
        { label: 'Client Name', value: `${depositTransaction.entityNumber}-${getClientName(depositTransaction)}` },
        { label: 'Account No.', value: depositTransaction.accountNumber },
        { label: 'Client Email', value: depositTransaction?.emailAddress ??""} //! add email property to model
    ];
    const transactionDetails: IDataDisplay[] = [
        { label: 'Transaction Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.transactionDate) },
        { label: 'Value Date', value: dateFormat_YY_MM_DD_NEW(depositTransaction.valueDate) },
        { label: 'Statement Reference', value: depositTransaction.bankReference },
        { label: 'Amount', value: depositTransaction.amount },
        // { label: 'Return note', value: depositTransaction?.note ??"" },
    ];

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
                    DEPOSITS TRANSACTIONS
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt='' />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    Return For Amendment
                </h3>
            </div>
            <hr />

            <form className='ijg-form' onSubmit={handleReturn}>
                <div className="dialog-content uk-position-relative modal-split-view-visible-scrollbar">
                    <div className="uk-grid uk-grid-small" data-uk-grid>
                        <div className="uk-width-expand">
                            <DetailView dataToDisplay={transactionDetails} />
                            <br />
                            <h4 className="main-title-sm">Allocation Details</h4>
                            <DetailView dataToDisplay={allocationDetails} />
                        </div>
                        <div className="uk-width-1-2">
                            <label className="uk-form-label uk-display-block required">Return Note</label>
                            <textarea
                                className="uk-form-small"
                                value={returnNote}
                                onChange={handleReasonChange}
                                placeholder="Please provide a reason"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="uk-text-right">
                    <button type='button' className='btn btn-danger' disabled={loading} onClick={onCancel}>Cancel</button>
                    <button type='submit' className='btn btn-primary' disabled={loading}> {loading ? <span data-uk-spinner={"ratio:.5"}></span> : "Return"}</button>
                </div>
            </form>
        </div>
    )
})

export default ReturnDepositForAmendmentModal
