export const removeHyphensFromDate = (dateString: string): string => {
    // replace method to remove hyphens from date format CCYY-MM-DD
    const formattedDate = dateString.replace(/-/g, '');
    
    return formattedDate;
}