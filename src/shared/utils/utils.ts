export const sortAlphabetically = (a: string, b: string) => {
  return a.localeCompare(b);
};


export const dateFormat_DD_MM_YY = (dateMillis: number | string | null) => {
  if (dateMillis === null) return "-";

  const date = new Date(dateMillis);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  // append 0 if month or day is less than 10
  const mn = `${month < 10 ? `0${month}` : month}`;
  const dd = `${day < 10 ? `0${day}` : day}`;

  return `${dd}-${mn}-${year}`;
};

export const dateFormat_YY_MM_DD = (dateMillis: number | string | null) => {
  if (dateMillis === null) return "-";

  const date = new Date(dateMillis);
  // const month = date.getMonth() + 1;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  // append 0 if month or day is less than 10
  const mn = `${month < 10 ? `0${month}` : month}`;
  const dy = `${day < 10 ? `0${day}` : day}`;

  return `${year}-${mn}-${dy}`;
};

export const dateFormat_YY_MM_DD_NEW = (dateMillis: number | string | null) => {
  if (dateMillis === null) return "-";

  const date = new Date(dateMillis);
  const year = date.getFullYear() - 2000; // Subtract 2000 to get the YY format
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Append 0 if month or day is less than 10
  const mn = `${month < 10 ? `0${month}` : month}`;
  const dy = `${day < 10 ? `0${day}` : day}`;

  return `${(year < 2000) ? (year + 2000) : year}-${mn}-${dy}`;
};

export const dateFormat = (dateMillis: number | string | null) => {
  if (dateMillis === null || dateMillis === 0 || dateMillis === undefined) {
    return "-";
  } else {
    // year numeric, month numeric, day numeric
    const date = new Date(dateMillis);

    return date.toLocaleDateString("en-UK", {
      month: "short",
      year: "numeric",
      day: "numeric",
    });
  }
};

export type InstrumentStatus = "pending" | "approved" | "tendered" | "allocated" | "submitted" |"purchased" | "matured" ;

export const formatText = (text: string) => {
  const regex = /([A-Z][a-z]*)/g;
  return text.replace(regex, ' $1');
};

export const generateNextValue = (currentValue: string) => {
  const prefix = currentValue.substring(0, 1);
  const number = parseInt(currentValue.substring(1));
  const nextNumber = number + 1;
  const paddedNextNumber = nextNumber.toString().padStart(5, "0");
  return prefix + paddedNextNumber;
};

export const generateNextValueWithIncrement = (currentValue: string, increment: number) => {
  const prefix = currentValue.substring(0, 1);
  const number = parseInt(currentValue.substring(1));
  const nextNumber = number + increment;
  const paddedNextNumber = nextNumber.toString().padStart(5, "0");
  return prefix + paddedNextNumber;
};


