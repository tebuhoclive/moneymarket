import { IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ProgressBar from "../../../../../../shared/components/progress/Progress";

import { useState, useRef } from 'react';
import { padNumberStringWithZero, splitAndTrimString } from '../../../../../../shared/functions/StringFunctions';
import { getAccount } from '../../../../../../shared/functions/transactions/BankStatementUpload';
import { dateFormat_YY_MM_DD } from '../../../../../../shared/utils/utils';
import { useAppContext } from '../../../../../../shared/functions/Context';
import { IWithdrawalTransaction, IWithdrawalTransactionQueueData } from '../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel';
import { getTimeFromTimestamp } from '../../../../../../shared/functions/DateToTimestamp';
import { currencyFormat, numberFormat } from '../../../../../../shared/functions/Directives';
import { generateBatchFileReference, getUser, onViewWithdrawalTransaction } from '../../../../../../shared/functions/MyFunctions';
import { Visibility } from '@mui/icons-material';
import DataGridToolbar from '../../../../shared/components/toolbar/DataGridToolbar';
import DataGridFooter from '../../../../shared/components/toolbar/DataGridFooter';
import Modal from '../../../../../../shared/components/Modal';
import MODAL_NAMES from '../../../../dialogs/ModalName';
import WithdrawalPaymentQueueModal from '../../../../dialogs/transactions/withdrawal-transaction/view-approve/WithdrawalPaymentQueueView';
import { TransactionType } from '../../../../shared/components/transaction-process-flag/TransactionProcess';
import { IWithdrawalPaymentBatch } from '../../../../../../shared/models/batches/BatchesModel';
import { ViewSplitWithdrawalModal } from '../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/ViewSplitWithdrawalModal';
import { ReturnSplitWithdrawalModal } from '../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/ReturnSplitWithdrawalModal';

interface IProp {
  loading: boolean;
  data: IWithdrawalTransaction[];
  transactionFilter: string;
}

const WithdrawalPaymentQueueGrid = (props: IProp) => {
  const { api, store } = useAppContext();
  const { data, transactionFilter, loading } = props;
  const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  const [loadingBatching, setLoadingBatching] = useState(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);

  const [progressPercentage, setProgressPercentage] = useState(0);

  const user = store.user.me?.asJson.uid;

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>

            <button disabled={loadingBatching || selectedTransactions.length === 0} className="btn btn-primary"
              onClick={onBatchSelectedPayments}
            >
              {loading || loadingBatching ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit (${selectedTransactions.length}) for Batching `}
            </button>
          </>

        }
      />
    );
  };

  const CustomFooter = () => {
    return (
      <DataGridFooter
        rightControls={
          <h4 className="main-title-md">
            Total Amount: {currencyFormat(totalValue)}
          </h4>
        }
        centerControls={
          <>
            {selectedTransactions.length > 0 && isVisibleProgressbar && <ProgressBar progress={progressPercentage} />}
          </>
        }
      />
    );
  };

  const onBatchSelectedPayments = async () => {
    setLoadingBatching(true);
    setIsVisibleProgressbar(true);
    const namibianUniversalBranchCodes = [
      "280172",
      "483772",
      "461609",
      "087373",
    ];

    const toBatch: IWithdrawalTransaction[] = []
    const selected: IWithdrawalTransaction[] = selectedTransactions.map((transaction) => ({
      transactionStatus: "Payment Queue",
      createdAtTime: {
        paymentQueue: Date.now(),
      },
      transactionAction: "Submitted for First Level Approval",
      capturedBy: transaction.capturedBy || "",
      firstLevelApprover: transaction.firstLevelApprover || "",
      secondLevelApprover: transaction.secondLevelApprover || "",
      id: transaction.id,
      transactionDate: transaction.transactionDate,
      valueDate: transaction.valueDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails,
      bankReference: transaction.bankReference,
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      sourceOfFunds: transaction.sourceOfFunds,
      withdrawalNodeType: "Parent",
      transactionIdentifier: transaction.transactionIdentifier,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      batchedBy: store.auth.meUID || "",
      processedBy: store.auth.meUID || ""
    }));
    for (const transaction of selected) {
      if (transaction.transactionType === "Split") {

        const splitTransactions: IWithdrawalTransaction[] = store.withdrawalTransaction.getWithdrawalChildTransactions(transaction.id)

        for (const splitTransaction of splitTransactions) {
          toBatch.push(splitTransaction);
        }
      } else {
        toBatch.push(transaction);
      }
    }

    const lowValueTransactions = toBatch.filter((t) => t.amount <= 5000000 && namibianUniversalBranchCodes.includes(splitAndTrimString("|", t.clientBankingDetails)[3].trim()));

    const highValueTransactions = toBatch.filter((t) => t.amount > 5000000 && namibianUniversalBranchCodes.includes(splitAndTrimString("|", t.clientBankingDetails)[3].trim()));

    const zarTransactions = toBatch.filter((t) => !namibianUniversalBranchCodes.includes(splitAndTrimString("|", t.clientBankingDetails)[3].trim()));

    const lowValueTransactionBatchValue = lowValueTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    const lowValueTransactionBatch: IWithdrawalPaymentBatch = {
      id: "",
      batchNumber: generateBatchFileReference(),
      paymentBatchFileTransactions: lowValueTransactions,
      batchedBy: user || "",
      paymentBatchFileType: "Normal",
      isFileDownloaded: false,
      batchedDateTime: Date.now(),
      batchFileStatus: 'Pending',
      lastModifiedBy: user || "",
      lastModifiedDateTime: Date.now(),
      batchFileValue: lowValueTransactionBatchValue,
      batchPaymentFileReport: []
    };

    if (lowValueTransactionBatch && lowValueTransactions.length > 0) {
      let completedCount = 0;
      for (const transaction of lowValueTransactions) {
        try {
          await api.withdrawalTransaction.updateBatchStatusAndCreateAuditTrail(
            transaction, transaction,
            transaction.id
          );
          completedCount++;
          const progress = (completedCount / lowValueTransactions.length) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) { }
      }
      await api.batches.create(lowValueTransactionBatch);
    };


    const highValueTransactionBatchValue = highValueTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const highValueTransactionBatch: IWithdrawalPaymentBatch = {
      id: "",
      batchNumber: generateBatchFileReference(),
      paymentBatchFileTransactions: highValueTransactions,
      batchedBy: user || "",
      paymentBatchFileType: "High",
      isFileDownloaded: false,
      batchedDateTime: Date.now(),
      batchFileStatus: 'Pending',
      lastModifiedBy: user || "",
      lastModifiedDateTime: Date.now(),
      batchFileValue: highValueTransactionBatchValue,
      batchPaymentFileReport: []
    };

    if (highValueTransactionBatch && highValueTransactions.length > 0) {
      let completedCount = 0;
      for (const transaction of highValueTransactions) {
        try {
          await api.withdrawalTransaction.updateBatchStatusAndCreateAuditTrail(
            transaction, transaction,
            transaction.id
          );
          completedCount++;
          const progress = (completedCount / highValueTransactions.length) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) { }
      }
      await api.batches.create(highValueTransactionBatch);
    };

    const zarValueTransactionBatchValue = zarTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const zarValueTransactionBatch: IWithdrawalPaymentBatch = {
      id: "",
      batchNumber: generateBatchFileReference(),
      paymentBatchFileTransactions: zarTransactions,
      batchedBy: user || "",
      paymentBatchFileType: "ZAR",
      isFileDownloaded: false,
      batchedDateTime: Date.now(),
      batchFileStatus: 'Pending',
      lastModifiedBy: user || "",
      lastModifiedDateTime: Date.now(),
      batchFileValue: zarValueTransactionBatchValue,
      batchPaymentFileReport: []
    };

    if (zarValueTransactionBatch && zarTransactions.length > 0) {
      let completedCount = 0;
      for (const transaction of zarTransactions) {
        try {
          await api.withdrawalTransaction.updateBatchStatusAndCreateAuditTrail(
            transaction, transaction,
            transaction.id
          );
          completedCount++;
          const progress = (completedCount / zarTransactions.length) * 100; // Calculate progress percentage
          setProgressPercentage(progress);
        } catch (error) { }
      }
      await api.batches.create(zarValueTransactionBatch);
    };

    setLoadingBatching(false);
    setIsVisibleProgressbar(false);
  };

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
              checked={selectedTransactions.length === paymentQueue.length}
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
      valueGetter: (params) => params.row.index,
    },
    {
      field: "transactionIndexedDate",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.transactionDate)} ${getTimeFromTimestamp(params.row.transactionDate)}`}
            </span>
          </div>
        )
      },
    },
    {
      field: "lastUpdate",
      headerName: "Last Update",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            <span className='uk-width-4-5'>
              {`${dateFormat_YY_MM_DD(params.row.createdAtTime)} ${getTimeFromTimestamp(params.row.createdAtTime)}`}
            </span>
          </div>
        )
      },
    },
    {
      field: "accountNumber",
      headerName: "Client Account",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.accountNumber || "-",
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
      field: "bankAccName",
      headerName: "Bank Acc Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[2] || "-"}
          </div>
        )
      },
    },
    {
      field: "bankAccNumber",
      headerName: "Bank Acc Number",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[1] || "-"}
          </div>
        )
      },
    },
    {
      field: "bankName",
      headerName: "Bank Name",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {splitAndTrimString('|', params.row.clientBankingDetails)[0] || "-"}
          </div>
        )
      },
    },
    {
      field: "email",
      headerName: "Client Email",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.emailAddress || "-"
    },
    {
      field: "product",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode || "-",
    },
    {
      field: "secondLevelApprover",
      headerName: "Approved By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.secondLevelApprover, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
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
      field: "Option",
      headerName: "Action",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          <IconButton data-uk-tooltip="View"
            onClick={() => onViewWithdrawalTransaction(params.row, store, setShowOnSubmitModal)}
          >
            <Visibility />
          </IconButton>
          <TransactionType type={params.row.withdrawalTransactionProcess} />
        </>
      ),
    },
  ];

  const paymentQueue: IWithdrawalTransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.paymentQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.paymentQueue || 0).getTime();
      return timeB - timeA; // Sorts in descending order
    }).map((transaction, index: number) => ({
      index: padNumberStringWithZero(`${index + 1}`, 2),
      id: transaction.id,
      emailAddress: transaction.emailAddress ?? "",
      valueDateView: dateFormat_YY_MM_DD(transaction.valueDate),
      valueDate: transaction.valueDate,
      transactionDateView: dateFormat_YY_MM_DD(transaction.transactionDate),
      transactionDate: transaction.transactionDate,
      amount: transaction.amount,
      accountNumber: transaction.accountNumber,
      accountName: transaction.accountNumber ? getAccount(transaction.accountNumber, store)?.accountName : "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails,
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      createdAtTime: transaction.createdAtTime.paymentQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      note: transaction.note || "",
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      secondLevelApprover: transaction.secondLevelApprover,
      firstLevelApprover: transaction.firstLevelApprover,
      capturedBy: transaction.capturedBy,
    }));

  const filteredData = paymentQueue.filter((d) => {
    if (transactionFilter.trim() === "All") {
      return true;
    } else {
      return d.transactionType.includes(transactionFilter);
    }
  });

  const totalValue = paymentQueue.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );


  const [selectedTransactions, setSelectedTransactions] = useState<IWithdrawalTransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);

  const handleTransactionCheckboxChange = (transaction: IWithdrawalTransactionQueueData) => {
    const isSelected = selectedTransactions.some(t => t.id === transaction.id);
    const newSelectedTransactions = isSelected
      ? selectedTransactions.filter(t => t.id !== transaction.id)
      : [...selectedTransactions, transaction];
    setSelectedTransactions(newSelectedTransactions);
  };

  const handleSelectAllTransactionChange = () => {
    const newSelectedTransactions = selectedTransactions.length === filteredData.length
      ? []
      : filteredData;
    setSelectedTransactions(newSelectedTransactions);
  };

  return (
    <div className='grid'>
      <DataGrid
        sx={{
          height: 'auto', width: '100%', maxHeight: 480,
          '& .MuiDataGrid-main': {
            overflow: 'auto',
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
          }
        }}
        loading={!filteredData}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id} // Use the appropriate identifier property
        rowHeight={50}
      />

      <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW}>
        {showOnSubmitModal && <WithdrawalPaymentQueueModal />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}>
        {showOnSubmitModal && <ViewSplitWithdrawalModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_SPLIT_MODAL}>
        <ReturnSplitWithdrawalModal setShowReturnModal={setShowOnSubmitModal} />
      </Modal>
    </div>
  )
}

export default WithdrawalPaymentQueueGrid
