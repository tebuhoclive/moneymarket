import { useEffect, useState } from "react";
import MODAL_NAMES from "../../ModalName";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { initiateMonthEnd } from "../../../../../shared/functions/transactions/MonthEndRunFunctions";
import swal from "sweetalert";
import { CustomOpenAccordion } from "../../../../../shared/components/accordion/Accordion";
import { IMonthEndRun, defaultMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";
import { rollBackMonthEnd } from "../../../system-modules/money-market-transactions-module/month-end/RollBackFunction";
import { StatementSummaryGrid } from "./StatementRunGrid";
import { clientEmail, clientName, clientPostalAddress, entityNumber } from "../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";
import { getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../shared/functions/transactions/Statement";
import { sendStatements } from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/statement-run-pdf/statement-email-templates/StatementEmail";

import { getProductName } from "../../../system-modules/reports-module/transactions/GetProductCode";
import { ACTIVE_ENV } from "../../../CloudEnv";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import DataGridToolbar from "../../../shared/components/toolbar/DataGridToolbar";
import ProgressBar from "../../../shared/components/progress-bar/ProgressBar";
import axios from "axios";
import { numberCurrencyFormat } from "../../../../../shared/functions/Directives";

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
  balance: number;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// const startOfMonth = new Date(Date.parse("2024-06-30"));
// const endOfMonth = new Date(Date.parse("2024-08-03"));

const startOfMonth = new Date(currentYear, currentMonth, 1);
const endOfMonth = new Date(currentYear, currentMonth + 1, 1);


interface IProps {
  setIsVisible: (show: boolean) => void;
}

export const StatementRun = observer(({ setIsVisible }: IProps) => {
  const { store } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [gettingData, setGettingData] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [accountsUpdated, setAccountsUpdated] = useState(0);
  const [processedData, setProcessedData] = useState<IStatementRunData[]>([]);
  const [selectedMonthEnd, setSelectedMonthEnd] = useState<IMonthEndRun>({ ...defaultMonthEndRun })

  const filteredProcessedData = processedData.filter((a) => a.balance != 0)

  const onCancel = () => {
    setIsVisible(false);
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.MONTH_END_INITIATION_MODAL);
    store.monthEndRun.clearSelected();
  };

  const onSendStatements = async () => {
    let completedCount = 0;

    swal({
      title: "Are you sure?",
      text: "Statements will be sent to clients via email",
      icon: "warning",
      buttons: ["Cancel", "Action Statement Run"],
      dangerMode: true,
    }).then(async (edit) => {
      if (edit) {
        setLoading(true);
        const promises = filteredProcessedData.map(async (account) => {
          const newAccount: IStatementRunData = {
            id: account.id,
            entityNumber: entityNumber(account.id, store),
            clientName: clientName(account.id, store),
            accountNumber: account.accountNumber,
            product: account.product,
            instrumentName: getProductName(store, account.product),
            emailAddress: clientEmail(account.id, store),
            rate: account.rate,
            postalAddress: clientPostalAddress(account.id, store),
            balance: account.balance
          }

          await sendStatements(
            newAccount,
            startOfMonth,
            endOfMonth
          );

          completedCount++; // Increment completed count
          const progress = (completedCount / processedData.length) * 100;
          setProgress(progress);
          setAccountsUpdated(completedCount);
        });

        try {
          await Promise.all(promises);
          swal({
            icon: "success",
            title: "Statement Run Completed",
          });
        } catch (error) {
          console.error("Error sending statements:", error);
          swal({
            icon: "error",
            title: "Oops!",
            text: "There was an error sending statements. Please try again.",
          });
        } finally {
          setLoading(false);
        }
      } else {
        swal({
          title: "Oops!",
          text: "Operation cancelled",
          icon: "error",
        });
      }
    });
  };

  useEffect(() => {
    if (store.monthEndRun.selected) {
      setSelectedMonthEnd(store.monthEndRun.selected);
    } else {
      //not selected
    }
  }, [store.monthEndRun.selected])


  const prepareData = async () => {
    setGettingData(true);

    const monthEndData = {
      accountType: selectedMonthEnd.productCode,
    };
    console.log("🚀 ~ prepareData ~ monthEndData:", monthEndData);

    const url = `${ACTIVE_ENV.url}getStatementRunData`;

    try {
      const response = await axios.post(url, monthEndData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      console.log("🚀 ~ prepareData ~ data:", data);
      setProcessedData(data);
    } catch (error) {
      console.error("Error occurred while preparing data:", error);

      // Additional error logging for network errors
      if (error) {
        console.error("Response error:", error);
      } else if (error) {
        console.error("No response received:", error);
      } else {
        console.error("Error setting up request:", error);
      }
    } finally {
      setGettingData(false); // Stop loader after data is retrieved or an error occurs
    }
  };

  const columns: GridColDef[] = [

    {
      field: "entityNumber",
      headerName: "Entity Number",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const entityId = entityNumber(params.row.id, store)
        return entityId;
      },

    },
    {
      field: "emailAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const email = clientEmail(params.row.id, store)
        return email;
      },
    },

    {
      field: "clientName",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const _clientName = clientName(params.row.id, store)
        return _clientName;
      },
    },
    {
      field: "postalAddress",
      headerName: "Email Address",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        const postalAddress = clientPostalAddress(params.row.id, store)
        return postalAddress;
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
      field: "product",
      headerName: "Product",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.product;
      },
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 200,
      headerClassName: "grid",
      valueGetter: (params) => {
        return params.row.rate
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
      renderCell: (params) => {
        const formattedCurrency = numberCurrencyFormat(params.row.balance)
        return (
          <>
            {formattedCurrency}
          </>
        )
      }
    },
  ];

  const CustomToolbar = () => {
    return (
      <DataGridToolbar
        rightControls={
          <>
            <button
              className="btn btn-primary"
              onClick={prepareData} disabled={loading || gettingData}
            >
              Prepare Data {gettingData && <span data-uk-spinner={"ratio:.5"}></span>}
            </button>
            <button
              className="btn btn-primary"
              onClick={onSendStatements} disabled={loading || gettingData}
            >
              Action Statement Run {loading && <span data-uk-spinner={"ratio:.5"}></span>}
            </button>
          </>
        }
      />
    );
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
            Statement Run
          </h3>
          <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
          <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
            {selectedMonthEnd.productName} ({selectedMonthEnd.productCode})
          </h3>
        </div>
        <hr />

        {gettingData ? <LoadingEllipsis /> :
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
              rows={filteredProcessedData}
              slots={{
                toolbar: CustomToolbar,
                // footer: CustomFooter,
              }}
              loading={loading}
              columns={columns}
              getRowId={(row) => row.id} // Use the appropriate identifier property
              rowHeight={40}
            />
            <div className="uk-width-1-1 uk-margin">
              <ProgressBar progress={progress} totalItems={0} title="Statement Run" />
            </div>
          </div>
        }

      </div>
    </ErrorBoundary>
  );
});

