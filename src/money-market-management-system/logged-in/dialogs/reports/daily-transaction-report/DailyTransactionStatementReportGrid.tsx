import { observer } from "mobx-react-lite";
import { Mail, OpenInNew, Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { IDailyTransactionReport, ISelectedClient } from "../../../system-modules/reports-module/transactions/DailyTransactionReport";
import { useAppContext } from "../../../../../shared/functions/Context";
import { getNaturalPersonsName } from "../../../../../shared/functions/MyFunctions";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import { useState } from "react";
import swal from "sweetalert";
import { getFilteredStatementTransactions, getStatementTotalDistribution, getStatementTotalDays } from "../../../../../shared/functions/transactions/Statement";
import { entityNumber, clientName, clientEmail, clientPostalAddress } from '../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions';
import { sendStatements } from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/statement-run-pdf/statement-email-templates/StatementEmail";
import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { faCheckCircle, faCancel, faMailBulk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProductName } from "../../../system-modules/reports-module/transactions/GetProductCode";
import DataGridFooter from "../../../shared/components/toolbar/DataGridFooter";
import DataGridToolbar from "../../../shared/components/toolbar/DataGridToolbar";
import { dateFormat_YY_MM_DD_NEW, dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import { transactions } from '../../../../logged-out/TestDating';

interface IProps {
  data: ISelectedClient[];
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

const DailyTransactionStatementReportGrid = observer((props: IProps) => {

  const { data } = props;
  const { api, store } = useAppContext();

  const [loading, setLoading] = useState<boolean>(false);
  const [isPreparingRun, setPreparingRun] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>(0);
  const [statementsSent, setStatementsSent] = useState(0);

  const clients = [
    ...store.client.naturalPerson.all.map(client => client.asJson),
    ...store.client.legalEntity.all.map(client => client.asJson)
  ];


  const getClientInfo = (parentEntityId: string): ILegalEntity | INaturalPerson | undefined => {
    const client = clients.find(client => client.entityId === parentEntityId);
    return client ? client : undefined;
  };

  interface IStatementRunData {
    id: string,
    entityNumber: string;
    clientName: string,
    accountNumber: string;
    product: string;
    instrumentName: string;
    emailAddress: string;
    rate: number;
    postalAddress: string;
  }

  const statementData: IStatementRunData[] = [];

  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedClientAccounts, setSelectedClientAccounts] = useState<MoneyMarketAccountModel[]>([]);

  const [transactions, setTransactions] = useState<IDailyTransactionReport[]>([]);

  const [transactionView, setTransactionView] = useState(false);

  const viewTransactionDetails = (transactions: IDailyTransactionReport[]) => {
    setTransactions(transactions);
    setTransactionView(true);
  }

  const addToSelectedClients = (entityId: string) => {
    setSelectedClientAccounts([]);
    if (entityId) {
      setSelectedClients(prevTransactions => {
        if (prevTransactions.includes(entityId)) {
          return prevTransactions.filter(id => id !== entityId);
        }
        return [...prevTransactions, entityId];
      });
    }
  }

  const selectAllClients = () => {
    setSelectedClientAccounts([]);
    const uniqueClientNames = Array.from(new Set(data.map(transaction => transaction.clientName)));
    setSelectedClients(uniqueClientNames);
  };

  const deselectAllClients = () => {
    setSelectedClients([]);
  }

  selectedClientAccounts.forEach((account) => {
    const newAccountData: IStatementRunData = {
      id: account.asJson.id,
      entityNumber: entityNumber(account.asJson.id, store),
      clientName: clientName(account.asJson.id, store),
      accountNumber: account.asJson.accountNumber,
      product: account.asJson.accountType,
      emailAddress: clientEmail(account.asJson.id, store),
      rate: account.asJson.clientRate || 0,
      postalAddress: clientPostalAddress(account.asJson.id, store),
      instrumentName: getProductName(store, account.asJson.accountType)
    };
    statementData.push(newAccountData);
  });

  const onPrepareStatementRun = () => {
    const toSend: MoneyMarketAccountModel[] = []
    setPreparingRun(true);
    for (const selectedClient of selectedClients) {

      const account = store.mma.all.find(account => account.asJson.parentEntity === selectedClient);

      if (account) {
        toSend.push(account);
      }
    }
    setPreparingRun(false);
    setSelectedClientAccounts(toSend);
  }

  const onSendStatements = async () => {
    let completedCount = 0;

    swal({
      title: "Statement Run",
      text: "You are about to send statements to the selected Clients, please ensure you have confirmed the list and the contents of the statements are all correct.",
      icon: "warning",
      buttons: ["Cancel", "Run"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);

        for (const account of statementData) {
          await api.statementTransaction.$getAll(account.id);
          const statementTransactions = store.statementTransaction.all.filter(
            (notBlinded) => notBlinded.asJson.blinded !== true
          );
          const statementTransactionsAsJson = statementTransactions.map(
            (transaction) => {
              return transaction.asJson;
            }
          );
          const filteredStatementTransactions = getFilteredStatementTransactions(
            startOfMonth,
            endOfMonth,
            statementTransactionsAsJson,
          );

          const totalDistribution = getStatementTotalDistribution(
            filteredStatementTransactions
          );
          const totalDays = getStatementTotalDays(filteredStatementTransactions);

          await sendStatements(account, startOfMonth, endOfMonth);

          completedCount++; // Increment completed count
          const progress = (
            (completedCount / statementData.length) *
            100
          );

          setProgress(progress);
          setStatementsSent(completedCount);
        }

        swal({
          icon: "success",
          title: "Statement Run Completed"
        })
        setLoading(false);
      } else {
        swal({
          title: "Oops!",
          text: "Operation cancelled",
          icon: "error"
        })
      }
    });
  }

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            {
              selectedClients.length !== data.length &&
              <button className="btn btn-primary" onClick={selectAllClients} disabled={loading}>
                <FontAwesomeIcon icon={faCheckCircle} /> Select All
              </button>
            }
            {
              selectedClients.length > 0 &&
              <button className="btn btn-danger" onClick={deselectAllClients} disabled={loading}>
                <FontAwesomeIcon icon={faCancel} /> Deselect All
              </button>
            }
            {
              selectedClients.length > 0 && selectedClientAccounts.length === 0 &&
              <button className="btn btn-primary" onClick={onPrepareStatementRun} disabled={loading || isPreparingRun}>
                Prepare Statement{selectedClients.length > 1 ? 's' : ''} {isPreparingRun && <span data-uk-spinner={"ratio:.5"}></span>}
              </button>
            }
            {
              selectedClientAccounts.length > 0 &&
              <button className="btn btn-primary" onClick={onSendStatements} disabled={loading}>
                <FontAwesomeIcon icon={faMailBulk} /> Send Statements to selected Client{selectedClients.length > 1 ? 's' : ''}{loading && <span data-uk-spinner={"ratio:.5"}></span>}
              </button>
            }
          </>
        }
      />
    );
  };



  const CustomToolbarTransactionView = () => {
    return (
      <DataGridToolbar
        centerControls={
          <>All the Transactions for the day belonging to: </>
        }
        rightControls={
          <>
            <button className="btn btn-primary" onClick={() => setTransactionView(false)} disabled={loading}>
              Back to Client List
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
            Total Amount:
            {/* {currencyFormat(totalValue)} */}
          </h4>
        }
        centerControls={
          <>
            {selectedClientAccounts.length > 0 &&
              <div className="uk-width-1-1 uk-margin">
                <label>Statement Run</label> <br />
                <label className="uk-form-label required">
                  {`Progress ${progress}% - ${statementsSent} out of ${selectedClientAccounts.length} completed`}
                </label>
                <progress
                  className="uk-progress"
                  value={progress}
                  max={100}
                ></progress>
              </div>
            }          </>
        }
      />
    );
  };

  const CustomFooterTransactionView = (transactions: IDailyTransactionReport[]) => {

    const totalWithdrawalValue = transactions.filter(t => t.transactionType === "Withdrawal").reduce(
      (sum, transaction) => sum + transaction.transactionAmount,
      0
    );

    const totalDepositValue = transactions.filter(t => t.transactionType === "Deposit").reduce(
      (sum, transaction) => sum + transaction.transactionAmount,
      0
    );

    return (
      <DataGridFooter
        rightControls={
          <>
            {
              totalWithdrawalValue !== 0 &&
              <h4 className="main-title-md">
                Total Withdrawals: {currencyFormat(totalWithdrawalValue)}
              </h4>

            }
            {
              totalDepositValue !== 0 &&
              <h4 className="main-title-md">
                Total Deposits: {currencyFormat(totalDepositValue)}
              </h4>
            }
          </>
        }
      />
    );
  };


  const columns: GridColDef[] = [
    {
      field: "checked",
      headerName: "",
      headerClassName: "grid",
      renderCell: (params) => (
        <>
          <input
            onChange={() => addToSelectedClients(params.row.clientName)}
            className="uk-checkbox"
            type="checkbox"
            name=""
            id=""
            checked={selectedClients.includes(params.row.clientName)}
            disabled={loading}
            readOnly
          />
        </>
      ),
    },
    {
      field: "clientName",
      headerName: "Client Name",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const clientName = getNaturalPersonsName(params.row.transactions[0].clientName, store);
        return clientName;
      },
    },
    {
      field: "emailAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const clientName = getClientInfo(params.row.transactions[0].clientName)?.contactDetail.emailAddress || "Not Provided";
        return clientName;
      },
    },
    {
      field: "totalTransactions",
      headerName: "Total Transactions",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.transactions.length,
    },
    {
      field: "Options",
      headerName: "Options",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => (
        <div>
          <>
            <IconButton data-uk-tooltip="View Transaction(s)"
              onClick={() => viewTransactionDetails(params.row.transactions)}
            >
              <Visibility />
            </IconButton>

            <IconButton data-uk-tooltip="Send Email"            >
              <Mail />
            </IconButton>
          </>
        </div>
      ),
    }
  ];

  const transactionColumns: GridColDef[] = [
    {
      field: "transaction Date",
      headerName: "Transaction Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => dateFormat_YY_MM_DD(params.row.transactionDate),
    },
    {
      field: "valueDate",
      headerName: "Value Date",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => dateFormat_YY_MM_DD(params.row.valueDate),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => currencyFormat(params.row.transactionAmount),
    },

    {
      field: "transactionType",
      headerName: "Transaction Type",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.transactionType,
    },
    {
      field: "transactionRemark",
      headerName: "Remark",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => params.row.transactionRemark,
    },
  ];

  return (
    <div className="grid">
      {
        !transactionView &&
        <DataGrid
          loading={!data}
          slots={{
            toolbar: CustomToolbar,
            footer: CustomFooter
          }}
          rows={data}
          columns={columns}
          getRowId={(row) => row.clientName}
          rowHeight={35}
        />
      }
      {
        transactionView &&
        <DataGrid
          loading={!transactions}
          slots={{
            toolbar: CustomToolbarTransactionView,
            footer: () => CustomFooterTransactionView(transactions)
          }}
          rows={transactions}
          columns={transactionColumns}
          getRowId={(row) => `${row.transactionDate} ${row.amount} ${row.product} ${row.account}`}
          rowHeight={35}
        />

      }


    </div>
  );
});

export default DailyTransactionStatementReportGrid;
