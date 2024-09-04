import { getFilteredStatementCloseOutTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../shared/functions/transactions/Statement";
import { IStatementTransaction } from "../../../../../shared/models/StatementTransactionModel";
import { dateFormat_YY_MM_DD_NEW } from "../../../../../shared/utils/utils";

export function calculateCloseOutInterest(
    transactions: IStatementTransaction[],
    startDate: Date,
    endDate: Date,
    closeOutDate: number,
    setLoader: (value: boolean) => void,
): { totalDays: number, totalDistribution: number } {





    setLoader(true);
    const filteredStatementTransactions = getFilteredStatementCloseOutTransactions(
        startDate,
        endDate,
        transactions,
        closeOutDate
    );

    const totalDays = getStatementTotalDays(filteredStatementTransactions);
    const totalDistribution = getStatementTotalDistribution(
        filteredStatementTransactions
    );
    setLoader(false);

    return {
        totalDays,
        totalDistribution
    };
}

