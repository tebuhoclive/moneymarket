// Function to check if a date is older than 1 year
export const isDateOlderThanOneYear = (date: number | null) => {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    // Compare dates
    if (date !== null && date >= oneYearAgo.getTime()) {
        return `Compliant ${new Date(date)}`;
    } else {
        return "Non-compliant";
    }
};