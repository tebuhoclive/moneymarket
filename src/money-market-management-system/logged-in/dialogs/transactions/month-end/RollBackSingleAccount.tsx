import { useEffect, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";

import { IMonthEndRun, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { clientEmail, clientName, clientPostalAddress } from "../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DataGridToolbar from "../../../shared/components/toolbar/DataGridToolbar";
import {  IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { reRunMonthEnd, rollBackMonthEndSingleAccount } from "../../../system-modules/money-market-transactions-module/month-end/RollBackFunction";

interface GridData {
  accountId: string;
  accountNumber: string;
  entityNumber: string;
  clientName: string;
  emailAddress: string;
  postalAddress: string;
  accountType: string;
  rolledBack?: boolean;
}



export const RollBackSingleAccounts = observer(() => {
  const { store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState("Processed");
  const [selectedMonthEnd, setSelectedMonthEnd] = useState<IMonthEndRun>({ ...defaultMonthEndRun })
  const moneyMarketAccounts = store.mma.getAllLiabilityAccountsNoZeroBalances()
    .filter((acc) => acc.asJson.accountType === selectedMonthEnd.productCode)
    .map((acc) => { return acc.asJson })



  useEffect(() => {
    setLoading(true)
    if (store.monthEndRun.selected) {
      setSelectedMonthEnd(store.monthEndRun.selected);
    } else {
    }
    setLoading(false)
  }, [store.monthEndRun.selected])


  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    store.monthEndRun.clearSelected();
  };

  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-3">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          type="button"
          data-uk-close
        ></button>
        <div className="form-title">
          <h3 style={{ marginRight: "1rem" }}>
            Roll back Single
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            Account(s)
          </h3>
        </div>
        <hr />
        <div className="uk-margin-bottom uk-text-right">
          <button className={`btn ${selectedTab === "Processed" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Processed")}>
            Processed Accounts
          </button>
          <button className={`btn ${selectedTab === "RolledBack" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("RolledBack")}>
            Rolled Back Accounts
          </button>
        </div>
        <hr />

        {selectedTab === "Processed" &&
          <ProcessedAccounts accounts={moneyMarketAccounts} loading={loading} />
        }

        {selectedTab === "RolledBack" &&
          <RolledBackAccounts accounts={moneyMarketAccounts} loading={loading} />
        }
      </div>
    </ErrorBoundary>
  );
});



interface IProcessedAccountsProps {
  accounts: IMoneyMarketAccount[],
  loading: boolean
}

const ProcessedAccounts = observer(({ accounts, loading }: IProcessedAccountsProps) => {
  const { store } = useAppContext();
  const [loader, setLoader] = useState(false);

  const [selectedMoneyMarketAccounts, setSelectedMoneyMarketAccounts] = useState<IMoneyMarketAccount[]>([]);
  console.log("ProcessedAccounts: ", selectedMoneyMarketAccounts)

  const handleSelectionChange = (accountId: string, isChecked: boolean) => {
    setSelectedMoneyMarketAccounts(prevSelected => {
      if (isChecked) {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
          return [...prevSelected, account];
        }
      } else {
        return prevSelected.filter(acc => acc.id !== accountId);
      }
      return prevSelected;
    });
  };

  const gridData: GridData[] = accounts
    .filter((account) => account.rolledBack !== true)
    .map((account) => ({
      accountId: account.id,
      accountNumber: account.accountNumber,
      entityNumber: account.parentEntity,
      clientName: clientName(account.id, store),
      emailAddress: clientEmail(account.id, store),
      postalAddress: clientPostalAddress(account.id, store),
      accountType: account.accountType,
      clientRate: account.clientRate,
      balance: account.balance,
      rolledBack: account.rolledBack
    }));


  const columns: GridColDef[] = [
    {
      field: "selecte",
      headerName: "Select Account",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const isChecked = selectedMoneyMarketAccounts.some(acc => acc.id === params.row.accountId);
        return (
          <input
            type="checkbox"
            className="uk-checkbox"
            checked={isChecked}
            onChange={(e) => handleSelectionChange(params.row.accountId, e.target.checked)}
          />
        );
      },
    },
    {
      field: "entityNumber",
      headerName: "Entity Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.entityNumber;
      }
    },
    {
      field: "emailAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.emailAddress;
      },
    },
    {
      field: "clientName",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.clientName;
      },
    },
    {
      field: "postalAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.postalAddress
      },
    },
    {
      field: "accountNumber",
      headerName: "Account Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.accountNumber;
      },
    },
    {
      field: "accountType",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.accountType;
      },
    },
    {
      field: "clientRate",
      headerName: "Rate",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.clientRate
      },
    },
    {
      field: "balance",
      headerName: "Balance",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.balance
      },
    },
  ];


  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button
            className="btn btn-primary"
            disabled={!selectedMoneyMarketAccounts.length || loader}
            onClick={() => rollBackMonthEndSingleAccount(selectedMoneyMarketAccounts, setLoader)}
          >
            Roll back selected accounts
          </button>
        }
      />
    );
  };

  return (
    <div className="grid">
      <DataGrid
        sx={{
          height: 'auto', width: '100%', maxHeight: 400,
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
        rows={gridData}
        slots={{
          toolbar: CustomToolbar,
        }}
        loading={loading || loader}
        columns={columns}
        getRowId={(row) => row.accountId}
        rowHeight={40}
      />
      <div className="uk-width-1-1 uk-margin">
        {/* <ProgressBar progress={progress} totalItems={0} title="Statement Run" /> */}
      </div>
    </div>
  );
});




const RolledBackAccounts = observer(({ accounts, loading }: IProcessedAccountsProps) => {
  const { store } = useAppContext();
  const [loader, setLoader] = useState(false);

  const [selectedMoneyMarketAccounts, setSelectedMoneyMarketAccounts] = useState<IMoneyMarketAccount[]>([]);

  const handleSelectionChange = (accountId: string, isChecked: boolean) => {
    setSelectedMoneyMarketAccounts(prevSelected => {
      if (isChecked) {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
          return [...prevSelected, account];
        }
      } else {
        return prevSelected.filter(acc => acc.id !== accountId);
      }
      return prevSelected;
    });
  };

  const gridData: GridData[] = accounts
    .filter((account) => account.rolledBack === true)
    .map((account) => ({
      accountId: account.id,
      accountNumber: account.accountNumber,
      entityNumber: account.parentEntity,
      clientName: clientName(account.id, store),
      emailAddress: clientEmail(account.id, store),
      postalAddress: clientPostalAddress(account.id, store),
      accountType: account.accountType,
      clientRate: account.clientRate,
      balance: account.balance,
      rolledBack: account.rolledBack
    }));


  const columns: GridColDef[] = [
    {
      field: "selecte",
      headerName: "Select Account",
      width: 200,
      headerClassName: "grid",
      renderCell: (params) => {
        const isChecked = selectedMoneyMarketAccounts.some(acc => acc.id === params.row.accountId);
        return (
          <input
            type="checkbox"
            className="uk-checkbox"
            checked={isChecked}
            onChange={(e) => handleSelectionChange(params.row.accountId, e.target.checked)}
          />
        );
      },
    },
    {
      field: "entityNumber",
      headerName: "Entity Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.entityNumber;
      }
    },
    {
      field: "emailAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.emailAddress;
      },
    },
    {
      field: "clientName",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.clientName;
      },
    },
    {
      field: "postalAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.postalAddress
      },
    },
    {
      field: "accountNumber",
      headerName: "Account Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.accountNumber;
      },
    },
    {
      field: "accountType",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.accountType;
      },
    },
    {
      field: "clientRate",
      headerName: "Rate",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.clientRate
      },
    },
    {
      field: "balance",
      headerName: "Balance",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.balance
      },
    },
  ];


  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <button
            className="btn btn-primary"
            disabled={!selectedMoneyMarketAccounts.length || loader}
            onClick={() => reRunMonthEnd(selectedMoneyMarketAccounts, setLoader)}
          >
            Re Run Month End
          </button>
        }
      />
    );
  };

  return (
    <div className="grid">
      <DataGrid
        sx={{
          height: 'auto', width: '100%', maxHeight: 400,
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
        rows={gridData}
        slots={{
          toolbar: CustomToolbar,
        }}
        loading={loading || loader}
        columns={columns}
        getRowId={(row) => row.accountId}
        rowHeight={40}
      />
      <div className="uk-width-1-1 uk-margin">
        {/* <ProgressBar progress={progress} totalItems={0} title="Statement Run" /> */}
      </div>
    </div>
  )
})
