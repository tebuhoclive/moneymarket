import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { observer } from "mobx-react-lite";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { toTitleCase } from '../../../../../../../shared/functions/Directives';
import { ExportAsExcel } from "react-export-table";

interface IProps {
    accountId: string;
    filteredTransactions: IStatementTransaction[];
    totalDays: number;
    totalDistribution: number;
    startDate: any;
    endDate: any;
}

interface IFormattedData {
    [key: string]: any;
    date: string;
    amount: number;
    previousBalance: number;
    balance: number;
    rate: number;
    days: number | undefined;
    interest: number;
    transaction: string;
}

export const StatementExcelComponent = observer((props: IProps) => {
    const { store } = useAppContext();
    const { accountId, filteredTransactions, totalDays, totalDistribution, startDate, endDate } = props;

    const account = store.mma.all.find((a) => a.asJson.id === accountId)?.asJson as IMoneyMarketAccount;

    const $startDate = dateStringToTimestamp(startDate);
    const $endDate = dateStringToTimestamp(endDate);

    const openingBalance =
        filteredTransactions &&
        (filteredTransactions[0]?.balance || 0);

    const closingBalance =
        filteredTransactions &&
        (
            filteredTransactions[filteredTransactions.length - 1]
                ?.balance || 0
        )


    const totalDeposits = filteredTransactions
        .filter((item) => item.remark.toLowerCase().includes("deposit"))
        .reduce((acc, item) => acc + item.amount, 0);

    const totalWithdrawals = filteredTransactions
        .filter((item) => item.remark.toLowerCase().includes("withdraw"))
        .reduce((acc, item) => acc + item.amount, 0);

    const renderExcel = ({ onClick }: { onClick: () => void }) => {
        return (
            <button className="btn btn-primary" onClick={onClick}>
                <FontAwesomeIcon
                    icon={faFileExcel}
                    size="lg"
                    className="icon uk-margin-small-right"
                />

            </button>
        );
    };

    const formattedData: IFormattedData[] = filteredTransactions.map((d) => {
        const $date = dateFormat_YY_MM_DD(d.date);
        const $amount = (d.transaction === "switchTo" || d.transaction === "withdrawal" ? -d.amount : d.amount);
        const $previousBalance = (d.previousBalance || 0);
        const $balance = (d.balance);
        const $rate = d.rate;
        const $days = d.days;
        const $interest = (d.distribution || 0);
        const $transaction = d.transaction;

        return {
            date: $date,
            amount: $amount,
            previousBalance: $previousBalance,
            balance: $balance,
            rate: $rate,
            days: $days,
            interest: $interest,
            transaction: $transaction
        };
    });

    // Headers array
    const headers = ["Date", "Amount", "Previous Balance", "Balance", "Rate", "Days", "Interest", "Transaction Type"];

    // Prepare the final data array including opening and closing balances as separate rows
    const enhancedData = [
        { date: "Opening Balance", amount: openingBalance },
        ...formattedData,
        { date: "Closing Balance", amount: closingBalance }
    ];

    const fileName = `${account.accountName} - (${account.accountNumber}) Account Statement ${dateFormat_YY_MM_DD(Date.now())}`

    return (
        <ExportAsExcel
            fileName={toTitleCase(fileName)}
            name="Statement"
            data={enhancedData}
            headers={headers}
        >
            {renderExcel}
        </ExportAsExcel>
    );
});

function dateStringToTimestamp(dateString: string): number {
    return Date.parse(dateString);
}