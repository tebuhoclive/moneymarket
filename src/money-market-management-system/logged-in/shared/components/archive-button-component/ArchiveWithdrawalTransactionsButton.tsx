import { useState } from 'react';
import './GetArchivedTransactionsButton.scss';
import Modal from '../../../../../shared/components/Modal';
import MODAL_NAMES from '../../../dialogs/ModalName';
import showModalFromId from '../../../../../shared/functions/ModalShow';

import { ACTIVE_ENV } from '../../../CloudEnv';
import { IDepositTransaction } from '../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import ViewArchivedTransactions from './ViewArchivedTransactions';

const GetArchivedWithdrawalTransactionsButton = () => {
    const [archivedTransactions, setArchivedTransactions] = useState<IDepositTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${ACTIVE_ENV.url}getAllArchiveWithdrawalTransactions`);
            if (response.ok) {
                const data = await response.json();
                setArchivedTransactions(data);
                showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_ARCHIVE_TRANSACTION_MODAL)

            } else {

            }
        } catch (error) {
        }
        setLoading(false);
    };

    return (
        <>
            <button disabled={loading} className="btn btn-primary" onClick={handleClick}            >
                View Archived Transactions{loading && <span className="spinner-loader" data-uk-spinner={"ratio:.5"}></span>}
            </button>
            <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_ARCHIVE_TRANSACTION_MODAL}>
                <ViewArchivedTransactions data={archivedTransactions} />
            </Modal >
        </>
    );
};

export default GetArchivedWithdrawalTransactionsButton;
