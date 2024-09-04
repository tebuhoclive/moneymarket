import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { IDepositTransaction } from '../../../../../../../shared/models/deposit-transaction/DepositTransactionModel';
import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../../../shared/utils/utils';
import { useAppContext } from '../../../../../../../shared/functions/Context';
import { currencyFormat, numberFormat } from '../../../../../../../shared/functions/Directives';

import MODAL_NAMES from '../../../../../dialogs/ModalName';
import Modal from '../../../../../../../shared/components/Modal';
import { useEffect, useRef, useState } from 'react';
import showModalFromId from '../../../../../../../shared/functions/ModalShow';
import { DepositAmendModal } from '../../../../../dialogs/transactions/client-deposit-allocation/new-modals/Deposits/amend-modal/DepositAmendModal';
import { getAccount } from '../../../../../../../shared/functions/transactions/BankStatementUpload';

import { observer } from 'mobx-react-lite';


import { padNumberStringWithZero } from '../../../../../../../shared/functions/StringFunctions';
import { getTimeFromTimestamp } from '../../../../../../../shared/functions/DateToTimestamp';
import Toolbar from '../../../../../shared/components/toolbar/Toolbar';
import { ACTIVE_ENV } from '../../../../../CloudEnv';

import DepositTransactionQueueView from '../../../../../dialogs/transactions/client-deposit-allocation/view-transaction-modal/DepositTransactionQueueView';
import GetArchivedTransactionsButton from '../../../../../shared/components/archive-button-component/ArchiveButton';
import { ViewSplitDepositModal } from '../../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const DeletedNonDepositsGrid = observer((props: IProps) => {
  const { store, api } = useAppContext();
  const { data, loading, transactionFilter } = props;
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const currentUser = store.auth.meUID || "";
  const [updateLoading, setUpdateLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);

  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
    bankValueDateView?: string;
    bankValueDate?: number;
    emailAddress?: string;
    valueDateView: string,
    valueDate: number,
    transactionDateView: string;
    transactionDate: number;
    amount: number;
    accountNumber: string;
    productCode: string;
    entityNumber: string;
    sourceBank: string;
    bankReference: string;
    sourceOfFunds: string;
    parentTransaction?: string;
    depositNodeType: "Parent" | "Child";
    statementIdentifier: string;
    createdAtTime: number;
    transactionType: string;
    allocationStatus: string;
    transactionStatus: string;
    depositTransactionProcess: string;
    description: string;
    sourceOfFundsAttachment: {
      url?: string, // if a source of fund description is provided ensure that an attachment is required
      reasonForNotAttaching: string
    }
    proofOfPaymentAttachment: {
      url?: string,
      reasonForNotAttaching: string
    }

  }

  const transactionQueue: ITransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.transactionQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.transactionQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    }).map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      bankTransactionDateView: transaction.bankTransactionDate ? dateFormat_YY_MM_DD_NEW(transaction.bankTransactionDate) : "",
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDateView: transaction.bankValueDate ? dateFormat_YY_MM_DD_NEW(transaction.bankValueDate) : "",
      bankValueDate: transaction.bankValueDate,
      valueDateView: dateFormat_YY_MM_DD(transaction.valueDate),
      valueDate: transaction.valueDate,
      emailAddress: transaction.emailAddress ?? "",
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: transaction.createdAtTime.transactionQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      depositTransactionProcess: transaction.depositTransactionProcess,
      description: transaction.description,
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      proofOfPaymentAttachment: {
        url: transaction.proofOfPaymentAttachment.url,
        reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching
      }
    }));

  const totalValue = transactionQueue.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const [selectedTransactions, setSelectedTransactions] = useState<ITransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);

  const handleTransactionCheckboxChange = (transaction: ITransactionQueueData) => {
    const isSelected = selectedTransactions.some(t => t.id === transaction.id);
    const newSelectedTransactions = isSelected
      ? selectedTransactions.filter(t => t.id !== transaction.id)
      : [...selectedTransactions, transaction];
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedTransactions = selectedTransactions.length === transactionQueue.length
      ? []
      : transactionQueue;
    setSelectedTransactions(newSelectedTransactions);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }


  const moveToNonDeposit = async (transaction: IDepositTransaction) => {

    const newDepositTransaction: IDepositTransaction = {
      id: transaction.id,
      transactionStatus: "Non-Deposit",
      createdAtTime: {
        nonDepositsQueue: Date.now(),
      },
      transactionAction: "Marked as a Non Deposit",
      bankValueDate: transaction.bankValueDate || 0,
      bankTransactionDate: transaction.bankTransactionDate || 0,
      parentTransaction: transaction.parentTransaction || "",
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching,
      },
      proofOfPaymentAttachment: {
        url: transaction.proofOfPaymentAttachment.url,
        reasonForNotAttaching: transaction.proofOfPaymentAttachment.reasonForNotAttaching,
      },
      sourceOfFunds: transaction.sourceOfFunds,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      depositTransactionProcess: transaction.depositTransactionProcess,
      description: transaction.description,
    };

    try {
      setIsRestoring(true);
      await api.depositTransaction.update(newDepositTransaction);
      setIsRestoring(true);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (selectAllTransactionsRef.current) {
      selectAllTransactionsRef.current.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < transactionQueue.length;
    }
  }, [selectedTransactions, transactionQueue.length]);

  const onAmendDepositTransaction = (transaction: IDepositTransaction) => {
    store.depositTransaction.select(transaction);
    setShowOnAmendModal(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
  }



  async function archiveDeletedTransactions() {
    const data = {
      transactions: selectedTransactions
    };

    const url = `${ACTIVE_ENV.url}archiveDepositTransactions`;

    try {
      setUpdateLoading(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("success:", response);
        await api.depositTransaction.getAll();
        store.depositTransaction.load();
        setUpdateLoading(false);
      } else {
        const errorText = await response.text();
        console.error("Error updating account:", errorText);
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Error in archiveDeletedTransaction:", error);
      throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
    }
  }



  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "",
      width: 2,
      headerClassName: "grid",
      disableColumnMenu: true,
      sortable: false,
      renderHeader: () => {
        return (
          <div>
            <input
              className="uk-checkbox uk-margin-top-small"
              type="checkbox"
              ref={selectAllTransactionsRef}
              checked={selectedTransactions.length === transactionQueue.length}
              onChange={handleSelectAllTransactionChange}
            />
          </div>

        )
      },
      renderCell: (params) => {
        return (
          <input
            className="uk-checkbox"
            type="checkbox"
            checked={selectedTransactions.some(t => t.id === params.row.id)}
            onChange={() => handleTransactionCheckboxChange(params.row)}
          />
        )
      },
    },
    {
      field: "index",
      headerName: "No",
      width: 2,
      headerClassName: "grid",
      disableColumnMenu: true,
      sortable: false,
      valueGetter: (params) => `${params.row.index}.`,
    },
    {
      field: "transactionIndexedDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.transactionDate)} ${getTimeFromTimestamp(params.row.transactionDate)}`}
            </span>
          </div>
        )
      },
    },
    {
      field: "bankReference",
      headerName: "Bank Reference",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.bankReference}
          </div>
        )
      },
    },
    {
      field: "accountNumber",
      headerName: "Client Account",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.accountNumber,
    },
    {
      field: "accountName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.accountName}
          </div>
        )
      },
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      editable: true,
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'right', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {numberFormat(params.row.amount)}
          </div>
        )
      },
    },
    {
      field: "product",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode,
    },
    {
      field: "creationMethod",
      headerName: "Creation Method",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.sourceBank}
          </div>
        )
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.transactionType} ({params.row.allocationStatus})
          </div>
        )
      },
    },
    {
      field: "options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <>
            <IconButton
              data-uk-tooltip="Restore"
              onClick={() => moveToNonDeposit(params.row)}
            >
              <RestoreIcon />
            </IconButton>
          </>
        )
      },
    },
  ];


  return (
    <div className="grid">
      <Toolbar
        rightControls={
          <>
            {
              selectedTransactions.length > 0 &&
              <>
                <button disabled={updateLoading} className="btn btn-danger" onClick={archiveDeletedTransactions}>
                  Archive Selected({selectedTransactions.length}) transactions
                </button>
              </>
            }
          </>
        }
      />
      {
        selectedTransactions.length > 0 && <hr className='uk-margin-small' />
      }
      {isRestoring && <>restoring transaction</>}

      <DataGrid
        sx={{
          height: 500,
          width: '100%',
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          },
          '& .MuiDataGrid-columnHeader': {
            '&:hover .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible',
            },
            '& .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible',
            }
          }
        }}
        loading={loading || updateLoading}
        slots={{
          toolbar: CustomToolbar
        }}
        rows={transactionQueue}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={80}
      />
      {
        selectedTransactions.length > 0 &&
        <div className="uk-width-1-2 uk-margin uk-text-left">
          <progress className="uk-progress" value={progressPercentage} max={100}></progress>
          <label className="uk-form-label">
            {`Progress: ${progressPercentage}% (${transactionsUpdated} / ${selectedTransactions.length} transactions processed)`}{" "}
          </label>
        </div>
      }
      <h4 className='main-title-sm uk-text-right uk-margin-small'> Total: {currencyFormat(totalValue)}</h4>

      <Modal
        modalId={
          MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL
        }>
        {showOnAmendModal &&
          <DepositAmendModal isVisible={setShowOnAmendModal} />
        }
      </Modal>
      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL}
      >
        {showOnSubmitModal && <DepositTransactionQueueView />}
      </Modal>

      <Modal
        modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}
      >
        {showOnSubmitModal && <ViewSplitDepositModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal>
    </div>
  )
})

export default DeletedNonDepositsGrid;
