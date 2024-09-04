import { useState } from 'react';
import './GetArchivedTransactionsButton.scss';
import Modal from '../../../../../shared/components/Modal';
import MODAL_NAMES from '../../../dialogs/ModalName';
import showModalFromId from '../../../../../shared/functions/ModalShow';
import ViewArchivedTransactions from './ViewArchivedTransactions';
import { ACTIVE_ENV } from '../../../CloudEnv';
import { IDepositTransaction } from '../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import ArchiveIcon from '@mui/icons-material/Archive';
import { IconButton } from "@mui/material";

const GetArchivedTransactionsButton = () => {
    const [archivedTransactions, setArchivedTransactions] = useState<IDepositTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${ACTIVE_ENV.url}getArchivedTransactions`);
            if (response.ok) {
                const data = await response.json();
                setArchivedTransactions(data);
                showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_ARCHIVE_TRANSACTION_MODAL)
            } else {
                console.error('Failed to fetch archived transactions');
            }
        } catch (error) {
            console.error('Error fetching archived transactions:', error);
        }
        setLoading(false);
    };

    return (
        <>
            <IconButton
                className="get-archived-transactions-button uk-margin-small-top" onClick={handleClick}
                data-uk-tooltip="Get Archived Transactions"
            >
                {loading ? (
                    <span className="spinner-loader" data-uk-spinner={"ratio:.5"}></span>
                ) : (
                    <ArchiveIcon className="archive-icon" style={{ fontSize: 23, color: "action" }}> {loading && <span data-uk-spinner={"ratio:.5"}></span>}</ArchiveIcon>
                )}
            </IconButton>
            <Modal
                modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_ARCHIVE_TRANSACTION_MODAL}
            >
                <ViewArchivedTransactions data={archivedTransactions} />
            </Modal>
        </>
    );
};

export default GetArchivedTransactionsButton;
