import React, { useState, useEffect } from 'react';
import { accountType } from '../SimpleFunctions';
import { useAppContext } from '../../../Context';
import { observer } from 'mobx-react-lite';
import { ExportAsExcel } from "react-export-table";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Toolbar from "../month-end-run/MonthEndToolBar";
import { numberCurrencyFormat, roundOff } from '../../../Directives';


interface MonthEndReportInterface {
  id: string;
  accountNumber: string;
  accountName: string;
  clientName: string;
  entityNumber: string;
  interest: number;
  days: number;
  lastRate: number;
  lastBalance: number;
}

interface ISummary {
  accountType: string
  totalAccounts: number;
  zeroBalanceAccounts: number;
  negativeBalanceAccounts: number;
  totalInterest: number;
  totalBalance: number;
  totalRate: number;
  totalDays: number;
}

interface IProps {
  data: MonthEndReportInterface[];
}

const MonthEndSummaryTable: React.FC<IProps> = observer(({ data }) => {
  const { store } = useAppContext();
  // State to store summary data
  const [summaryData, setSummaryData] = useState<ISummary[]>([]);
  // State to indicate if data is loading
  const [isLoading, setIsLoading] = useState(true);





  useEffect(() => {
    const calculateSummaryData = () => {
      const summaryByAccountType: { [key: string]: ISummary } = {};

      data.forEach(account => {
        const { lastBalance, interest, days, lastRate } = account;

        if (!summaryByAccountType[accountType(account.accountNumber, store)]) {
          summaryByAccountType[accountType(account.accountNumber, store)] = {
            accountType: accountType(account.accountNumber, store),
            totalAccounts: 0,
            zeroBalanceAccounts: 0,
            negativeBalanceAccounts: 0,
            totalInterest: 0,
            totalBalance: 0,
            totalRate: 0,
            totalDays: 0,
          };
        }

        summaryByAccountType[accountType(account.accountNumber, store)].totalAccounts++;

        if (lastBalance === 0) {
          summaryByAccountType[accountType(account.accountNumber, store)].zeroBalanceAccounts++;
        } else if (lastBalance < 0) {
          summaryByAccountType[accountType(account.accountNumber, store)].negativeBalanceAccounts++;
        }

        summaryByAccountType[accountType(account.accountNumber, store)].totalInterest += interest;
        summaryByAccountType[accountType(account.accountNumber, store)].totalBalance += lastBalance;
        summaryByAccountType[accountType(account.accountNumber, store)].totalRate += lastRate;
        summaryByAccountType[accountType(account.accountNumber, store)].totalDays += days;
      });

      return Object.values(summaryByAccountType);
    };

    setIsLoading(true);
    setTimeout(() => {
      const summary = calculateSummaryData();
      setSummaryData(summary);
      setIsLoading(false);
    }, 2000);
  }, [data]);


  const totalAccounts = summaryData.reduce((acc, item) => acc + item.totalAccounts, 0);
  const totalZeroBalance = summaryData.reduce((acc, item) => acc + item.zeroBalanceAccounts, 0);
  const totalNegativeBalance = summaryData.reduce((acc, item) => acc + item.negativeBalanceAccounts, 0);
  const totalInterest = summaryData.reduce((acc, item) => acc + item.totalInterest, 0);
  const totalBalance = summaryData.reduce((acc, item) => acc + item.totalBalance, 0);
  const totalRate = summaryData.reduce((acc, item) => acc + item.totalRate, 0) / totalAccounts;
  const totalDays = summaryData.reduce((acc, item) => acc + item.totalDays, 0) / totalAccounts;


  const renderExcel = ({ onClick }: { onClick: () => void }) => {
    return (
      <button className="btn btn-primary" onClick={onClick}>
        <FontAwesomeIcon
          icon={faFileExcel}
          size="lg"
          className="icon uk-margin-small-right"
        />
        Export Excel
      </button>
    )
  }


  const formattedData = summaryData.map((d) => {

    const $product = d.accountType;
    const $accounts = d.totalAccounts;
    const $zeroBalance = d.zeroBalanceAccounts;
    const $negativeBalance = d.negativeBalanceAccounts;
    const $interest = d.totalInterest;
    const $balance = d.totalBalance;
    const $rate = d.totalRate / d.totalAccounts;
    const $days = Math.round(d.totalDays / d.totalAccounts);

    return (
      {
        accountType: $product,
        totalAccounts: $accounts,
        totalZeroBalance: $zeroBalance,
        totalNegativeBalance: $negativeBalance,
        totalInterest: $interest,
        totalBalance: $balance,
        totalRate: $rate,
        days: $days
      }
    )
  })


  return (
    <div>

      <Toolbar
        rightControls={
          <>
            <ExportAsExcel
              fileName="Month End Summary"
              name="Summary"
              data={formattedData}
              headers={
                ["Product", "Total Accounts",
                  "Zero Balance Accounts", "Negative Balance Accounts",
                  "Total Interest", "Total Balance",
                  "Average Rate", "Average Days"]
              }
            >{renderExcel}
            </ExportAsExcel>
          </>
        }
      />



      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="split-view-visible-scrollbar" style={{ width: "100%" }}>
          <table className="uk-table uk-table-small uk-table-divider">
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Accounts</th>
                <th>Zero Balance Accounts</th>
                <th>Negative Balance Accounts</th>
                <th>Total Balance</th>
                <th>Average Rate</th>
                <th>Total Interest</th>
                <th>Average Days</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((summary, index: number) => (
                <tr key={index}>
                  <td>{summary.accountType}</td>
                  <td>{summary.totalAccounts}</td>
                  <td>{summary.zeroBalanceAccounts}</td>
                  <td>{summary.negativeBalanceAccounts}</td>
                  <td>{numberCurrencyFormat(roundOff(summary.totalBalance))}</td>
                  <td>{roundOff((summary.totalRate)) / summary.totalAccounts} %</td>
                  <td>{numberCurrencyFormat(roundOff((summary.totalInterest)))}</td>
                  <td>{Math.round(summary.totalDays / summary.totalAccounts)}</td>
                </tr>
              ))}

            </tbody>
            <tfoot>
              <tr>
                <td>Totals</td>
                <td>{(totalAccounts)}</td>
                <td>{(totalZeroBalance)}</td>
                <td>{(totalNegativeBalance)}</td>
                <td>{numberCurrencyFormat(totalBalance)}</td>
                <td>{(totalRate)} %</td>
                <td>{numberCurrencyFormat(totalInterest)}</td>
                <td>{Math.round(totalDays)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
});

export default MonthEndSummaryTable;
