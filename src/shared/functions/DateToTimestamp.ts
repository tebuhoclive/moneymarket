import { padNumberStringWithZero } from "./StringFunctions";

// Reusable function to convert "dd/mm/yy" date string to timestamp
export const convertDateStringToTimestampSlash = (dateString: string): number | null => {
  const parts = dateString.split('/').map(Number);

  if (parts.length === 3) {
    const [day, month, year] = parts;

    // Create a new Date object with the year adjusted for the century (assumed 20xx)
    const date = new Date(year + 2000, month - 1, day); // Month is zero-based

    // Get the timestamp (milliseconds since epoch) using Date.getTime()
    return date.getTime();
  }

  return null; // Invalid input
};

export const convertDateStringToTimestampDash = (dateString: string): number | null => {
  const parts = dateString.split('-').map(Number);

  if (parts.length === 3) {
    const [day, month, year] = parts;

    // Create a new Date object with the year adjusted for the century (assumed 20xx)
    const date = new Date(year + 2000, month - 1, day); // Month is zero-based

    // Get the timestamp (milliseconds since epoch) using Date.getTime()
    return date.getTime();
  }

  return null; // Invalid input
};

export const convertDateStringToTimestampMonth = (dateString: string): number | null => {
  // Define a mapping of month abbreviations to their numeric values
  const monthAbbreviations: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const parts = dateString.split('-');

  if (parts.length === 3) {
    const [day, monthAbbreviation, year] = parts;

    const month = monthAbbreviations[monthAbbreviation];

    if (month !== undefined) {
      // Create a new Date object with the year adjusted for the century (assumed 20xx)
      const date = new Date(parseInt(year) + 2000, month, Number(day));

      // Get the timestamp (milliseconds since epoch) using Date.getTime()
      return date.getTime();
    }
  }

  return null; // Invalid input
};

export const getTimeFromTimestamp =(timestamp: number): string => {
  // Convert timestamp to Date object
  const date: Date = new Date(timestamp);

  // Extract time components
  const hours: number = date.getHours();
  const minutes: number = date.getMinutes();
  // const seconds: number = date.getSeconds();

  // Format the time as a string
  // const formattedTime: string = `${hours}:${minutes}:${seconds}`;
  const formattedTime: string = `${padNumberStringWithZero(hours.toString(),2)}:${padNumberStringWithZero(minutes.toString(),2)}`;

  return formattedTime;
}