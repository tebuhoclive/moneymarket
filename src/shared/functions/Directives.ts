import { IBondPurchaseAllocation } from "../models/purchases/bonds/BondPurchaseAllocationModel";
import { IFixedDepositPurchaseAllocation } from "../models/purchases/fixed-deposit/FixedDepositPurchaseAllocationModel";
import { ITreasuryBillPurchaseAllocation } from "../models/purchases/treasury-bills/TreasuryBillPurchaseAllocationModel";
import { dateFormat } from "../utils/utils";

export const dataFormat = (
  dataType:
    | string
    | "Date"
    | "Percentage"
    | "Number"
    | "Currency"
    | "Time"
    | "Custom",
  value: number | null | string,
  dataSymbol: string,
  symbolPos?: "prefix" | "suffix"
) => {
  if ((!value || value === undefined) && value !== 0) return "-";

  switch (dataType) {
    case "Date":
      return dateFormat(value);
    case "Percentage":
      return `${value}%`;
    case "Number":
      return (Number(value));
    case "Currency":
      const val = currencyFormat(value, dataSymbol);
      return `${val}`;
    case "Time":
      return `${value} ${dataSymbol}`;
    case "Custom":
      return `${value} (${dataSymbol})`;
    default:
      return `${value} ${dataSymbol}`;
  }
};

export const currencyFormat = (
  value: number | null | string,
  currency = "NAD"
) => {
  // if is not a number, or undefine, return empty string
  if (value === null || value === undefined) return "-";
  const numValue = Number(value);
  if (isNaN(numValue)) return "-";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NAD", //if value.currency gives a currency not defined error
    }).format(numValue);
  } catch (error) {
    // console.log("Catch error", error);
    return `${currency} ${value}`;
  }
};

export const numberFormat = (value: number) => {
  if (value === 0) return "0.00";
  // if is not a number, or undefine, return empty string
  if (!value || isNaN(value)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(value);
};

export const numberCurrencyFormat = (value: number) => {
  if (value === 0) return "0.00";
  // if is not a number, or undefine, return empty string
  if (!value || isNaN(value)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const roundOff = (numberToRoundOff: number)=>{
  let truncatedNumber: number = Math.floor(numberToRoundOff * 100) / 100;
  return truncatedNumber;
} 



const MAX_DESCRIPTION_LENGTH = 110;

export const trimDescription = (description: string) => {
  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  } else {
    return description.slice(0, MAX_DESCRIPTION_LENGTH) + "...";
  }
};

// export const treasuryBillAllocation = (clients: ITreasuryBillPurchaseAllocation[]) => {
//   const clientNominal = clients.reduce((acc, client) => { return acc + (client.newNominal) }, 0).toFixed(2);
//   const tenderRate = clients.reduce((acc, client) => { return acc + (client.tenderRate) }, 0).toFixed(2);
//   const clientRate = clients.reduce((acc, client) => { return acc + (client.clientRate) }, 0).toFixed(2);
//   const margin = clients.reduce((acc, client) => { return acc + (client.margin) }, 0).toFixed(2);
//   const considerationBON = clients.reduce((acc, client) => { return acc + (client.considerationBON) }, 0).toFixed(2);
//   const considerationClient = clients.reduce((acc, client) => { return acc + (client.considerationClient) }, 0).toFixed(2);
//   const profit = clients.reduce((acc, client) => { return acc + (client.profit) }, 0).toFixed(2);

//   return { tenderRate, margin, clientNominal, clientRate, considerationBON, considerationClient, profit };
// };

// export const treasuryBillAllocation = (clients: ITreasuryBillPurchaseAllocation[]) => {
//   const initialTotal = {
//     clientNominal: 0,
//     tenderRate: 0,
//     clientRate: 0,
//     margin: 0,
//     considerationBON: 0,
//     considerationClient: 0,
//     profit: 0,
//   };

//   const totals = clients.reduce((acc, client) => {
//     acc.clientNominal += parseFloat(client.newNominal);
//     acc.tenderRate += parseFloat(client.tenderRate);
//     acc.clientRate += parseFloat(client.clientRate);
//     acc.margin += parseFloat(client.margin);
//     acc.considerationBON += parseFloat(client.considerationBON);
//     acc.considerationClient += parseFloat(client.considerationClient);
//     acc.profit += parseFloat(client.profit);
//     return acc;
//   }, initialTotal);

//   return {
//     tenderRate: totals.tenderRate.toFixed(2),
//     margin: totals.margin.toFixed(2),
//     clientNominal: totals.clientNominal.toFixed(2),
//     clientRate: totals.clientRate.toFixed(2),
//     considerationBON: totals.considerationBON.toFixed(2),
//     considerationClient: totals.considerationClient.toFixed(2),
//     profit: totals.profit.toFixed(2),
//   };
// };

// export const treasuryBillAllocation = (clients: ITreasuryBillPurchaseAllocation[]) => {
//   const clientNominal = clients.reduce((acc, client) => acc + parseFloat(client.newNominal), 0);
//   const tenderRate = clients.reduce((acc, client) => acc + parseFloat(client.tenderRate), 0);
//   const clientRate = clients.reduce((acc, client) => acc + parseFloat(client.clientRate), 0);
//   const margin = clients.reduce((acc, client) => acc + parseFloat(client.margin), 0);
//   const considerationBON = clients.reduce((acc, client) => acc + parseFloat(client.considerationBON), 0);
//   const considerationClient = clients.reduce((acc, client) => acc + parseFloat(client.considerationClient), 0);
//   const profit = clients.reduce((acc, client) => acc + parseFloat(client.profit), 0);

//   return {
//     tenderRate: tenderRate.toFixed(2),
//     margin: margin.toFixed(2),
//     clientNominal: clientNominal.toFixed(2),
//     clientRate: clientRate.toFixed(2),
//     considerationBON: considerationBON.toFixed(2),
//     considerationClient: considerationClient.toFixed(2),
//     profit: profit.toFixed(2),
//   };
// };

export const treasuryBillAllocation = (clients: ITreasuryBillPurchaseAllocation[]) => {
  const clientNominal = clients.reduce((acc, client) => acc + client.newNominal, 0);
  const tenderRate = clients.reduce((acc, client) => acc + client.tenderRate, 0);
  const clientRate = clients.reduce((acc, client) => acc + client.clientRate, 0);
  const margin = clients.reduce((acc, client) => acc + client.margin, 0);
  const considerationBON = clients.reduce((acc, client) => acc + client.considerationBON, 0);
  const considerationClient = clients.reduce((acc, client) => acc + client.considerationClient, 0);
  const profit = clients.reduce((acc, client) => acc + client.profit, 0);

  return {
    tenderRate: tenderRate.toFixed(2),
    margin: margin.toFixed(2),
    clientNominal: clientNominal.toFixed(2),
    clientRate: clientRate.toFixed(2),
    considerationBON: considerationBON.toFixed(2),
    considerationClient: considerationClient.toFixed(2),
    profit: profit.toFixed(2),
  };
};



export const tbPurchaseConsideration = (tenderRate: number, clientNominal: number, days: number) => {
  const _considerationBON = clientNominal / (1 + (tenderRate / 100) * (days / 365));
  return _considerationBON.toFixed(2)
};

export const tbClientConsideration = (clientRate: number, clientNominal: number, days: number) => {
  const _considerationClient = clientNominal / (1 + (clientRate / 100) * (days / 365));
  return _considerationClient.toFixed(2)
};

export const bondAllocation = (clients: IBondPurchaseAllocation[]) => {
  const clientNominal = clients.reduce((acc, client) => acc + client.newNominal, 0);
  const tenderRate = clients.reduce((acc, client) => acc + client.tenderRate, 0);
  const clientRate = clients.reduce((acc, client) => acc + client.clientRate, 0);
  const margin = clients.reduce((acc, client) => acc + client.margin, 0);
  const considerationBON = clients.reduce((acc, client) => acc + client.considerationBON, 0);
  const considerationClient = clients.reduce((acc, client) => acc + client.considerationClient, 0);
  const profit = clients.reduce((acc, client) => acc + client.profit, 0);

  return {
    tenderRate: tenderRate.toFixed(2),
    margin: margin.toFixed(2),
    clientNominal: clientNominal.toFixed(2),
    clientRate: clientRate.toFixed(2),
    considerationBON: considerationBON.toFixed(2),
    considerationClient: considerationClient.toFixed(2),
    profit: profit.toFixed(2),
  };
};



export const bondPurchaseConsideration = (tenderRate: number, clientNominal: number, days: number) => {
  const _considerationBON = clientNominal / (1 + (tenderRate / 100) * (days / 365));
  return _considerationBON.toFixed(2)
};

export const bondClientConsideration = (clientRate: number, clientNominal: number, days: number) => {
  const _considerationClient = clientNominal / (1 + (clientRate / 100) * (days / 365));
  return _considerationClient.toFixed(2)
};

export const fixedDepositAllocation = (clients: IFixedDepositPurchaseAllocation[]) => {
  const clientNominal = clients.reduce((acc, client) => acc + client.newNominal, 0);
  const tenderRate = clients.reduce((acc, client) => acc + client.tenderRate, 0);
  const clientRate = clients.reduce((acc, client) => acc + client.clientRate, 0);
  const margin = clients.reduce((acc, client) => acc + client.margin, 0);
  const considerationBON = clients.reduce((acc, client) => acc + client.considerationBON, 0);
  const considerationClient = clients.reduce((acc, client) => acc + client.considerationClient, 0);
  const profit = clients.reduce((acc, client) => acc + client.profit, 0);

  return {
    tenderRate: tenderRate.toFixed(2),
    margin: margin.toFixed(2),
    clientNominal: clientNominal.toFixed(2),
    clientRate: clientRate.toFixed(2),
    considerationBON: considerationBON.toFixed(2),
    considerationClient: considerationClient.toFixed(2),
    profit: profit.toFixed(2),
  };
};



export const fixedDepositPurchaseConsideration = (tenderRate: number, clientNominal: number, days: number) => {
  const _considerationBON = clientNominal / (1 + (tenderRate / 100) * (days / 365));
  return _considerationBON.toFixed(2)
};

export const fixedDepositClientConsideration = (clientRate: number, clientNominal: number, days: number) => {
  const _considerationClient = clientNominal / (1 + (clientRate / 100) * (days / 365));
  return _considerationClient.toFixed(2)
};
export const toTitleCase = (str: string) => {
  if (str.length <= 3) {
    return str;
  }

  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  );
};