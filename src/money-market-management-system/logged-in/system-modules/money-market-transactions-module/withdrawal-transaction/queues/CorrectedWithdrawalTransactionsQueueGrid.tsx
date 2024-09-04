import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
import { observer } from "mobx-react-lite";
import { IWithdrawalTransaction } from "../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { IconButton } from "@mui/material";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getUser } from "../../../../../../shared/functions/MyFunctions";
import { Visibility } from "@mui/icons-material";
import { getTimeFromTimestamp } from "../../../../../../shared/functions/DateToTimestamp";
import { currencyFormat, numberFormat } from "../../../../../../shared/functions/Directives";
import { TransactionType } from "../../../../shared/components/transaction-process-flag/TransactionProcess";
import DataGridToolbar from "../../../../shared/components/toolbar/DataGridToolbar";
import DataGridFooter from "../../../../shared/components/toolbar/DataGridFooter";
import { padNumberStringWithZero } from "../../../../../../shared/functions/StringFunctions";
import { getAccount } from "../../../../../../shared/functions/transactions/BankStatementUpload";
import { useState } from "react";

interface IProp {
  loading: boolean;
  data: IWithdrawalTransaction[];
  transactionFilter: string;
  selectedDeletedTab: string;
  setSelectedDeletedTab: React.Dispatch<React.SetStateAction<string>>
}

interface IDeletedQueueData {
  index: string,
  id: string;
  emailAddress?: string;
  valueDateView: string,
  valueDate: number,
  transactionDateView: string;
  transactionDate: number;
  amount: number;
  accountNumber: string;
  productCode: string;
  entityNumber: string;
  clientBankingDetails: string;
  bankReference: string;
  sourceOfFunds: string;
  parentTransaction?: string;
  withdrawalNodeType: "Parent" | "Child";
  transactionIdentifier: string;
  createdAtTime: number;
  transactionType: string;
  allocationStatus: string;
  transactionStatus: string;
  withdrawalTransactionProcess: string;
  description: string;
  clientInstruction: {
    url?: string, // if a source of fund description is provided ensure that an attachment is required
    reasonForNotAttaching: string
  }
  sourceOfFundsAttachment: {
    url?: string,
    reasonForNotAttaching: string
  },
  note?: string;
  capturedBy: string | undefined;
}


export const CorrectedWithdrawalTransactionsQueueGrid = observer(({ data, transactionFilter, loading, selectedDeletedTab, setSelectedDeletedTab }: IProp) => {
  const { store } = useAppContext();

  const correctedQueue: IDeletedQueueData[] = data
    .sort((a, b) => {
      const timeA = new Date(a.createdAtTime.deletedQueue || 0).getTime();
      const timeB = new Date(b.createdAtTime.deletedQueue || 0).getTime();
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
      productCode: transaction.productCode,
      entityNumber: transaction.entityNumber,
      clientBankingDetails: transaction.clientBankingDetails, //!verify
      bankReference: transaction.bankReference,
      sourceOfFunds: transaction.sourceOfFunds,
      parentTransaction: transaction.parentTransaction,
      withdrawalNodeType: transaction.withdrawalNodeType,
      transactionIdentifier: transaction.transactionIdentifier,
      reasonForDeleting:transaction.reasonForDeleting,
      createdAtTime: transaction.createdAtTime.deletedQueue || 0,
      transactionType: transaction.transactionType,
      allocationStatus: transaction.allocationStatus,
      transactionStatus: transaction.transactionStatus,
      withdrawalTransactionProcess: transaction.withdrawalTransactionProcess,
      description: transaction.description,
      note: transaction.note || "",
      clientInstruction: {
        url: transaction.clientInstruction.url,
        reasonForNotAttaching: transaction.clientInstruction.reasonForNotAttaching
      },
      sourceOfFundsAttachment: {
        url: transaction.sourceOfFundsAttachment.url,
        reasonForNotAttaching: transaction.sourceOfFundsAttachment.reasonForNotAttaching
      },
      capturedBy: transaction.capturedBy
    }));

  const filteredData = correctedQueue.filter((d) => {
    if (transactionFilter.trim() === "All") {
      return true;
    } else {
      return d.transactionType.includes(transactionFilter);
    }
  });


  const totalValue = filteredData.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            <button disabled={filteredData.length === 0} className="btn btn-primary"
            >
              Export PDF
            </button>
            <button disabled={filteredData.length === 0} className="btn btn-primary"
            >
              Export Excel
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
      />
    );
  };


  const columns: GridColDef[] = [
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
      field: "lastUpdate",
      headerName: "Last Update",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        return (
          <div className='uk-grid uk-grid-small uk-grid-match' style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }} data-uk-grid>
            <span>
              {`${dateFormat_YY_MM_DD(params.row.createdAtTime)} ${getTimeFromTimestamp(params.row.createdAtTime)}`}
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
            {params.row.accountName || "-"}
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
      field: "firstLevelApprover",
      headerName: "First-Level Approved By",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const user = getUser(params.row.firstLevelApprover, store)
        return (
          <div style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {user}
          </div>
        )
      },
    },
    {
      field: "secondLevelApprover",
      headerName: "Second-Level Approved By",
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
          //  onClick={() => onViewTransaction(params.row, store, setShowOnSubmitModal)}
          >
            <Visibility />
          </IconButton>
          <TransactionType type={params.row.withdrawalTransactionProcess} />

        </>
      ),
    },
  ];
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
        loading={false}
        slots={{
          toolbar: CustomToolbar,
          footer: CustomFooter
        }}
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id} //Use the appropriate identifier property
        rowHeight={50}
      />
    </div>
  );
});

