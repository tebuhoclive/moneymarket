import AppApi from "../../apis/AppApi";
import { IStatementTransaction } from "../../models/StatementTransactionModel";
import { IMoneyMarketAccount } from "../../models/money-market-account/MoneyMarketAccount";
import { onReAlign } from "./CorrectionsOnStatement";

export const getFilteredStatementTransactions = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[]
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateDays(transaction.date)
        : calculateDays(
            transaction.date,
            filteredStatementTransactions[index + 1].date
          );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

export const getFilteredFeeStatementTransactions = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[],
  account: IMoneyMarketAccount
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateDays(transaction.date)
        : calculateDays(
            transaction.date,
            filteredStatementTransactions[index + 1].date
          );
    transaction.distribution = Number(
      ((transaction.balance * (account.baseRate - transaction.rate)) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

export const getFilteredStatementTransactionsFutureInterest = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[],
  futureDate: number
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateFutureDays(transaction.date, futureDate)
        : calculateFutureDays(
            transaction.date,
            filteredStatementTransactions[index + 1].date,
            futureDate
          );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

export const getFilteredStatementMonthEndTransactions = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[],
  monthEndDate: number
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateMonthEndDays(transaction.date, undefined, monthEndDate)
        : calculateMonthEndDays(
            transaction.date,
            filteredStatementTransactions[index + 1].date,
            monthEndDate
          );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

export const getFilteredStatementMonthEndTransactionsView = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[],
  monthEndDate: number
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateMonthEndDaysView(transaction.date, undefined, monthEndDate)
        : calculateMonthEndDaysView(
            transaction.date,
            filteredStatementTransactions[index + 1].date,
            monthEndDate
          );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

export const calculateDays = (
  transactionDate: number,
  nextTransactionDate?: number
): number => {
  const currentDate = new Date();
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
    );
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    );
  }
};

export const calculateMonthEndDays = (
  transactionDate: number,
  nextTransactionDate?: number,
  monthEnd?: number
): number => {
  const currentDate = new Date();
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
    );
  } else if (monthEnd) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays =
      Math.ceil(
        (monthEnd - transactionDateTime.getTime()) / millisecondsPerDay
      ) + 1; // Add 1 to include both start and end dates
    return remainingDays;
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    ); // minus 1 to exclude current day
  }
};

export const calculateMonthEndDaysView = (
  transactionDate: number,
  nextTransactionDate?: number,
  monthEnd?: number
): number => {
  const _currentDate = new Date();
  const currentYear = _currentDate.getFullYear();
  const currentMonth = _currentDate.getMonth();
  const currentDate = new Date(currentYear, currentMonth + 1, 1);

  // const currentDate = new Date(Date.parse("2024-06-30"));
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
    );
  } else if (monthEnd) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays =
      Math.ceil(
        (monthEnd - transactionDateTime.getTime()) / millisecondsPerDay
      ) + 1; // Add 1 to include both start and end dates
    return remainingDays;
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    ); // minus 1 to exclude current day
  }
};

export const getStatementTotalDays = (
  filteredStatementTransactions: IStatementTransaction[]
) => {
  const totalDays = filteredStatementTransactions.reduce((acc, curr) => {
    if (!curr.blinded) {
      return acc + (curr.days || 0);
    } else {
      return acc;
    }
  }, 0);
  return totalDays;
};

export const getStatementTotalFees = (
  filteredStatementTransactions: IStatementTransaction[]
) => {
  const totalDistribution = filteredStatementTransactions.reduce(
    (acc, curr) => {
      if (!curr.blinded) {
        return acc + (curr.distribution || 0);
      } else {
        return acc;
      }
    },
    0
  );

  return totalDistribution;
};

export const getStatementTotalDistribution = (
  filteredStatementTransactions: IStatementTransaction[]
) => {
  const totalDistribution = filteredStatementTransactions.reduce(
    (acc, curr) => {
      if (!curr.blinded) {
        return acc + (curr.distribution || 0);
      } else {
        return acc;
      }
    },
    0
  );

  return totalDistribution;
};

export const calculateInterest = (
  statementTransactionsAsJson: IStatementTransaction[],
  filteredStatementTransactions: IStatementTransaction[]
) => {
  filteredStatementTransactions.forEach((transaction, index) => {
    const { balance, rate, transaction: type } = transaction;
    transaction.distribution = Number(
      ((balance * rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
    return transaction.distribution;
  });
};

export const calculateFeeInterest = (
  statementTransactionsAsJson: IStatementTransaction[],
  filteredStatementTransactions: IStatementTransaction[],
  account: IMoneyMarketAccount
) => {
  filteredStatementTransactions.forEach((transaction, index) => {
    const { balance, rate, transaction: type } = transaction;

    const fee = account.baseRate - rate;

    switch (type) {
      case "deposit":
        transaction.distribution = Number(
          ((balance * fee) / 100) *
            (transaction.days ? transaction.days / 365 : 0 / 365)
        );
        return transaction.distribution;

      case "withdrawal":
        transaction.distribution = Number(
          ((balance * fee) / 100) *
            (transaction.days ? transaction.days / 365 : 0 / 365)
        );
        return transaction.distribution;

      case "switchFrom":
        transaction.distribution = Number(
          ((balance * fee) / 100) *
            (transaction.days ? transaction.days / 365 : 0 / 365)
        );
        return transaction.distribution;

      case "switchTo":
        transaction.distribution = Number(
          ((balance * fee) / 100) *
            (transaction.days ? transaction.days / 365 : 0 / 365)
        );
        return transaction.distribution;

      case "rateChange":
        if (statementTransactionsAsJson[index + 1]) {
          filteredStatementTransactions[index + 1].rate = transaction.rate;
          transaction.distribution = Number(
            ((balance * fee) / 100) *
              (transaction.days ? transaction.days / 365 : 0 / 365)
          );
        }
        return transaction.distribution;
    }
  });
};

export const getTotalDaysInMonth = (
  statementTransactionsAsJson: IStatementTransaction[]
): number => {
  // Create a map to store the number of days for each unique month-year combination
  const daysInMonthMap: { [key: string]: number } = {};

  for (const entry of statementTransactionsAsJson) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    // Calculate the number of days in the current month
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    // Generate a unique key for the month-year combination
    const monthYearKey = `${year}-${month + 1}`;

    // Update the map with the number of days for the current month
    daysInMonthMap[monthYearKey] = daysInCurrentMonth;
  }

  // Sum up the total number of days in all unique month-year combinations
  const totalDays = Object.values(daysInMonthMap).reduce(
    (total, days) => total + days,
    0
  );

  return totalDays;
};

export const calculateCloseOutDays = (
  transactionDate: number,
  nextTransactionDate?: number,
  closeOutDate?: number
): number => {
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
    );
  } else if (closeOutDate) {
    const endOfMonth = new Date(
      transactionDateTime.getFullYear(),
      transactionDateTime.getMonth(),
      closeOutDate
    );
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.ceil(
      (endOfMonth.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
    ); // No need to add 1 to include the end date
    return remainingDays;
  } else {
    const currentDate = new Date();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    );
  }
};
export const calculateFutureDays = (
  transactionDate: number,
  nextTransactionDate?: number,
  futureDate?: number
): number => {
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    );
  } else if (futureDate) {
    const endOfMonth = new Date(
      transactionDateTime.getFullYear(),
      transactionDateTime.getMonth(),
      futureDate
    );
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays =
      Math.ceil(
        (endOfMonth.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1; // No need to add 1 to include the end date
    return remainingDays;
  } else {
    const currentDate = new Date();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
          millisecondsPerDay
      ) - 1
    );
  }
};

export const getFilteredStatementCloseOutTransactions = (
  startDate: Date,
  endDate: Date,
  statementTransactionsAsJson: IStatementTransaction[],
  closeOutDate: number
) => {
  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateCloseOutDays(transaction.date, closeOutDate)
        : calculateCloseOutDays(
            transaction.date,
            filteredStatementTransactions[index + 1].date,
            closeOutDate
          );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
        (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  return filteredStatementTransactions;
};

//for roll back
export async function getLatestTransactions(
  account: IMoneyMarketAccount,
  transactions: IStatementTransaction[],
  api: AppApi
) {
  if (transactions.length === 0) {
    return []; // or handle empty array case as needed
  }

  const sortedTransactions = transactions
    .sort((a, b) => b.date - a.date)
    .slice(0, 2);

  for (const transaction of sortedTransactions.slice(0, 2)) {
    try {
      const prevousBalance =
        transaction.remark === "Capitalise" &&
        transaction.balance - transaction.amount;

      if (
        transaction.remark === "Opening Balance after Capitalisation" ||
        transaction.remark === "Opening Balance after Capitalization"
      ) {
        await api.statementTransaction.delete(account.id, transaction);
      }

      if (prevousBalance) {
        await onReAlign(account.id);
        await api.statementTransaction.delete(account.id, transaction);
      }
    } catch (error) {}
  }

  // Return the first two transactions from the sorted array (latest transactions)
  return transactions.slice(0, 2);
}
