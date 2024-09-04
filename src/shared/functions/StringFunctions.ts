export const addSpacesToString = (inputString: string, numberOfSpaces: number): string => {
    // Create a string with the specified number of spaces
    const spaces = ' '.repeat(numberOfSpaces);

    // Concatenate the spaces with the input string
    const resultString = inputString + spaces;

    return resultString;
}

export const splitAndTrimString = (splitCharacter: string, stringToSplit: string) =>{
    const stringArray = stringToSplit.split(splitCharacter)
    return stringArray;
}


export const generateSpaceFiller = (numberOfSpaces: number): string => {
    // Check if the number of spaces is a positive integer
    if (!Number.isInteger(numberOfSpaces) || numberOfSpaces < 0) {
        throw new Error('Invalid number of spaces');
    }

    // Create a string with the specified number of spaces
    const spaces = ' '.repeat(numberOfSpaces);

    return spaces;
}


export const padTextStringWithSpace = (inputTextString: string, totalLength: number): string => {
    // Check if the input is a valid string and total length is a positive integer
    if (typeof inputTextString !== 'string' || !Number.isInteger(totalLength) || totalLength < 0) {
        throw new Error('Invalid input or total length');
    }

    const currentLength = inputTextString.length;

    // Check if padding is needed
    if (currentLength >= totalLength) {
        return inputTextString; // No padding needed
    }

    // Calculate the number of spaces needed for padding
    const spacesToAdd = totalLength - currentLength;
    const spacePadding = ' '.repeat(spacesToAdd);

    // Concatenate the spaces with the input string
    const resultString = inputTextString + spacePadding;
    return resultString;
}

export const padNumberStringWithZero = (inputNumberString: string, totalLength: number): string => {
    // Check if the input is a valid string and total length is a positive integer
    if (typeof inputNumberString !== 'string' || !Number.isInteger(totalLength) || totalLength < 0) {
        throw new Error('Invalid input or total length');
    }

    const currentLength = inputNumberString.length;

    // Check if padding is needed
    if (currentLength >= totalLength) {
        return inputNumberString; // No padding needed
    }

    // Calculate the number of zeros needed for padding
    const zerosToAdd = totalLength - currentLength;
    const zeroPadding = '0'.repeat(zerosToAdd);

    // Concatenate the zeros with the input string
    const resultString = zeroPadding + inputNumberString;

    return resultString;
}

export const getElementAtIndex = (originalText: string, index: number): string => {
    const elements: string[] = originalText.split("|");
    return elements[index];
}