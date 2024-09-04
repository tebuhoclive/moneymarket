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
import { ViewSplitDepositModal } from '../../../../../dialogs/transactions/client-deposit-allocation/record-transaction-modal/deposit-modal/ViewSplitDepositModal';

interface IProps {
  loading: boolean;
  data: IDepositTransaction[];
  transactionFilter: string;
}

const DeletedAfterProcessedQueueGrid = observer((props: IProps) => {
  const { store } = useAppContext();
  const { data, loading, transactionFilter } = props;
  const [showOnAmendModal, setShowOnAmendModal] = useState<boolean>(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const currentUser = store.auth.meUID || "";
  const [updateLoading, setUpdateLoading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [transactionsUpdated, setTransactionsUpdated] = useState(0);

  interface ITransactionQueueData {
    index: string,
    id: string;
    bankTransactionDateView?: string;
    bankTransactionDate?: number;
    bankValueDateView?: string;
    bankValueDate?: number;
    emailAddress?:string;
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
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      emailAddress: transaction.emailAddress ?? "",
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


  const markSelectedAsNonDeposit = async (selectedTransactions: ITransactionQueueData[]) => {

    const transactions: IDepositTransaction[] = selectedTransactions.map((transaction, index: number) => ({
      id: transaction.id,
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDate: transaction.bankValueDate,
      valueDate: transaction.valueDate,

      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: {
        transactionQueue: transaction.createdAtTime || 0
      },
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

    let completedCount = 0;
    const url = `${ACTIVE_ENV.url}onMarkAsNonDepositHandler`;

    const processTransaction = async (transaction: IDepositTransaction) => {

      const oldTransaction = store.depositTransaction.getItemById(
        transaction.id
      );

      if (oldTransaction) {

        const _transactionToUpdate: IDepositTransaction = {
          ...oldTransaction.asJson,
          transactionStatus: "Non-Deposit",
          createdAtTime: {
            transactionQueue: oldTransaction.asJson.createdAtTime.transactionQueue,
            nonDepositsQueue: Date.now()
          },
        };

        const payload = {
          oldTransaction: oldTransaction.asJson,
          transaction: _transactionToUpdate,
          user: store.user.me?.asJson.uid
        }

        try {
          setUpdateLoading(true);
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const progress = ((completedCount / selectedTransactions.length) * 100).toFixed(2); // Calculate progress percentage
            setTransactionsUpdated(completedCount);
            setProgressPercentage(Number(progress));
            completedCount++;
          } else {
            console.log("Failed", response.statusText);
          }
          setUpdateLoading(false);
        } catch (error) {
          console.log("Error", error);
          return false;
        }
      }
    };

    transactions.forEach(transaction => {
      processTransaction(transaction);
    });

  }

  const moveSelectedToUnallocated = async (selectedTransactions: ITransactionQueueData[]) => {

    const transactions: IDepositTransaction[] = selectedTransactions.map((transaction) => ({
      id: transaction.id,
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDate: transaction.bankValueDate,
      valueDate: transaction.valueDate,
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: {
        transactionQueue: transaction.createdAtTime || 0
      },
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

    let completedCount = 0;
    const url = `${ACTIVE_ENV.url}onMoveToUnallocatedHandler`;

    const processTransaction = async (transaction: IDepositTransaction) => {

      const oldTransaction = store.depositTransaction.getItemById(
        transaction.id
      );

      if (oldTransaction) {

        const _transactionToUpdate: IDepositTransaction = {
          ...oldTransaction.asJson,
          transactionStatus: "Unallocated",
          createdAtTime: {
            transactionQueue: oldTransaction.asJson.createdAtTime.transactionQueue,
            unAllocatedQueue: Date.now()
          },
        };

        const payload = {
          oldTransaction: oldTransaction.asJson,
          transaction: _transactionToUpdate,
          user: store.user.me?.asJson.uid
        }

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            completedCount++;
            const progress = ((completedCount / selectedTransactions.length) * 100).toFixed(2); // Calculate progress percentage
            setTransactionsUpdated(completedCount);
            setProgressPercentage(Number(progress));
          } else {
            console.log("Failed", response.statusText);
            console.log("Failed Payload", payload);
          }
        } catch (error) {
          console.log("Error", error);
        }
      }
    };

    transactions.forEach(transaction => {
      processTransaction(transaction);
    });
  }

  const onSubmitFirstLevelApproval = async (selectedTransactions: ITransactionQueueData[]) => {

    const transactions: IDepositTransaction[] = selectedTransactions.map((transaction) => ({
      id: transaction.id,
      bankTransactionDate: transaction.bankTransactionDate,
      bankValueDate: transaction.bankValueDate,
      valueDate: transaction.valueDate,
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      sourceBank: transaction.sourceBank,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      depositNodeType: transaction.depositNodeType,
      statementIdentifier: transaction.statementIdentifier,
      createdAtTime: {
        transactionQueue: transaction.createdAtTime || 0
      },
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

    let completedCount = 0;
    const url = `${ACTIVE_ENV.url}onSubmitDepositFirstLevelApprovalHandler`;

    const processTransaction = async (transaction: IDepositTransaction) => {

      const oldTransaction = store.depositTransaction.getItemById(
        transaction.id
      );

      if (oldTransaction) {

        const _transactionToUpdate: IDepositTransaction = {
          ...oldTransaction.asJson,
          accountNumber: oldTransaction.asJson.id,
          transactionStatus: "First Level",
          createdAtTime: {
            transactionQueue: oldTransaction.asJson.createdAtTime.transactionQueue,
            firstLevelQueue: Date.now()
          },
          capturedBy: currentUser,
        };

        const payload = {
          oldTransaction: oldTransaction.asJson,
          transaction: _transactionToUpdate,
          user: store.user.me?.asJson.uid
        }

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            completedCount++;
            const progress = ((completedCount / selectedTransactions.length) * 100).toFixed(2); // Calculate progress percentage
            setTransactionsUpdated(completedCount);
            setProgressPercentage(Number(progress));
          } else {
            console.log("Failed", response.statusText);
            console.log("Failed Payload", payload);
          }
        } catch (error) {
          console.log("Error", error);
        }
      }
    };

    transactions.forEach(transaction => {
      processTransaction(transaction);
    });
  }

  const columns: GridColDef[] = [
    // {
    //   field: "checked",
    //   headerName: "",
    //   width: 2,
    //   headerClassName: "grid",
    //   disableColumnMenu: true,
    //   sortable: false,
    //   renderHeader: () => {
    //     return (
    //       <div>
    //         <input
    //           className="uk-checkbox uk-margin-top-small"
    //           type="checkbox"
    //           ref={selectAllTransactionsRef}
    //           checked={selectedTransactions.length === transactionQueue.length}
    //           onChange={handleSelectAllTransactionChange}
    //         />
    //       </div>

    //     )
    //   },
    //   renderCell: (params) => {
    //     return (
    //       <input
    //         className="uk-checkbox"
    //         type="checkbox"
    //         checked={selectedTransactions.some(t => t.id === params.row.id)}
    //         onChange={() => handleTransactionCheckboxChange(params.row)}
    //       />
    //     )
    //   },
    // },
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
            <span>
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
            {/* <IconButton data-uk-tooltip="View" onClick={() => onViewTransaction(params.row, store, setShowOnSubmitModal)}>
              <Visibility />
            </IconButton> */}
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
                <button className="btn btn-danger" onClick={() => markSelectedAsNonDeposit(selectedTransactions)}>
                  Mark Selected({selectedTransactions.length}) as Non-Deposits
                </button>
                <button className="btn btn-danger" onClick={() => moveSelectedToUnallocated(selectedTransactions)}>
                  Move Selected({selectedTransactions.length}) to Unallocated
                </button>
                <button className="btn btn-primary" onClick={() => onSubmitFirstLevelApproval(selectedTransactions)}>
                  Submit Selected({selectedTransactions.length}) for Approval
                </button>
              </>
            }
          </>
        }
      />
      {
        selectedTransactions.length > 0 && <hr className='uk-margin-small' />
      }

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

export default DeletedAfterProcessedQueueGrid;
