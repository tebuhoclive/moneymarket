import { observer } from "mobx-react-lite";
import { IWithdrawalTransaction, IWithdrawalTransactionQueueData } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { getClientName, getMMAProduct, getUser, onViewWithdrawalTransaction } from "../../../../../../shared/functions/MyFunctions";
import { useRef, useState } from "react";
import { padNumberStringWithZero, splitAndTrimString } from "../../../../../../shared/functions/StringFunctions";
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import { Visibility } from "@mui/icons-material";
import { TransactionType } from "../../../../shared/components/transaction-process-flag/TransactionProcess";
import { currencyFormat, numberFormat } from "../../../../../../shared/functions/Directives";
import { getAccount } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import ProgressBar from "../../../../../../shared/components/progress/Progress";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import Modal from "../../../../../../shared/components/Modal";
import FirstLevelWithdrawalTransactionQueueView from "./transaction-views/first-level-transaction-view/FirstLevelTransactionView";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import ReturnWithdrawalForAmendment from "../../../../dialogs/transactions/client-deposit-allocation/new-modals/Deposits/return-for-amendment/ReturnWithdrawalForAmendmentModal";
import { ViewSplitWithdrawalModal } from "../../../../dialogs/transactions/withdrawal-transaction/split-withdrawals/ViewSplitWithdrawalModal";
import swal from "sweetalert";

interface IProp {
  loading: boolean;
  data: IWithdrawalTransaction[];
  transactionFilter: string;
}

export const WithdrawalFirstLevelApprovalGrid = observer(({ data, transactionFilter, loading }: IProp) => {
  const { store, api } = useAppContext();
  const [selectedTransactions, setSelectedTransactions] = useState<IWithdrawalTransactionQueueData[]>([]);
  const selectAllTransactionsRef = useRef<HTMLInputElement>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isVisibleProgressbar, setIsVisibleProgressbar] = useState(false);
  const [showOnSubmitModal, setShowOnSubmitModal] = useState<boolean>(false);
  const user = store.user.me?.asJson.uid;

  const firstLevelQueue: IWithdrawalTransactionQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.firstLevelQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.firstLevelQueue || 0).getTime();
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
      accountName: transaction.accountName ? getAccount(transaction.accountNumber, store)?.accountName : "",
      clientName: getClientName(transaction, store) || "",
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails, //!verify
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      createdAtTime: transaction.createdAtTime.firstLevelQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      reasonForDeleting: transaction.reasonForDeleting,
      note: transaction.note || "",
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      capturedBy: transaction.capturedBy,
    }));

  const filteredData = firstLevelQueue.filter((d) => {
    if (transactionFilter.trim() === "All") {
      return true;
    } else {
      return d.transactionType.includes(transactionFilter);
    }
  });

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

  const totalValue = filteredData.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button disabled={loadingSubmit || selectedTransactions.length === 0} className="btn btn-primary"
            onClick={approveSelectedForSecondLevel}
          >
            {loadingSubmit ? <span data-uk-spinner={"ratio:.5"}></span> : `Submit (${selectedTransactions.length}) for Approval `}
          </button>
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
              checked={selectedTransactions.length === firstLevelQueue.length}
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
            {params.row.clientName || "-"}
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
      renderCell: (params) => {
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {params.row.emailAddress || "-"}
          </div>
        )
      },
    },
    {
      field: "product",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.productCode || "-",
    },
    {
      field: "capturedBy",
      headerName: "Captured By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.capturedBy, store)
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

  const approveSelectedForSecondLevel = async () => {
    setLoadingSubmit(true);
    setIsVisibleProgressbar(true)
    let completedCount = 0;
    const totalTransactions = selectedTransactions.length;

    for (const transaction of selectedTransactions) {
      if (transaction.accountNumber !== "" && user) {
        const newWithdrawal: IWithdrawalTransaction = {
          createdAtTime: {
            secondLevelQueue: Date.now()
          },
          transactionStatus: "Second Level",
          transactionAction: "Approved First Level",
          firstLevelApprover: user,
          capturedBy: transaction.capturedBy,
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
          emailAddress: transaction.emailAddress
        }
        try {
          await api.withdrawalTransaction.update(newWithdrawal);
          completedCount++;
          const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
          setProgressPercentage(Number(progress));
        } catch (error) {
        }
      } else if (transaction.transactionType === "Split") {
        const newTransaction: IWithdrawalTransaction = {
          ...transaction,
          parentTransaction: transaction.parentTransaction || "",
          productCode: getMMAProduct(transaction.accountNumber, store),
          createdAtTime: {
            secondLevelQueue: Date.now()
          },
          transactionStatus: "Second Level",
          transactionAction: "Approved Second Level",
          emailAddress: transaction.emailAddress || "",
          capturedBy: transaction.capturedBy || "",
          firstLevelApprover: store.auth.meUID || "",
        };
        try {
          if (transaction) {
            await api.withdrawalTransaction.update(newTransaction);
            completedCount++;
            const progress = ((completedCount / totalTransactions) * 100).toFixed(2); // Calculate progress percentage
            setProgressPercentage(Number(progress))
          } else {
            swal({
              icon: "warning",
              text: "No transaction found"
            })
          }
        } catch (error) {
          swal({
            icon: "error",
            text: "System could not process the transaction"
          })
        }
      }
    }
    setLoadingSubmit(false);
    setIsVisibleProgressbar(false)

  };

  return (
    <div className="grid">
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
        loading={loadingSubmit}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={50}
      />
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW}>
        {showOnSubmitModal && <FirstLevelWithdrawalTransactionQueueView />}
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.RETURN_FOR_AMENDMENT_MODAL}>
        <ReturnWithdrawalForAmendment />
      </Modal>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL}>
        {showOnSubmitModal && <ViewSplitWithdrawalModal setShowReturnModal={setShowOnSubmitModal} />}
      </Modal>
    </div>
  );
});

