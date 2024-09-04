import * as xlsx from 'xlsx';

// Function to read Excel file and return the data
const readExcelFile = (filePath: string): any => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { header: 1 });
};

// Read NCPI_index from Excel file
const filePath = '\\\\IJG01\\Data\\IJG Wealth\\Projects\\LOTS MONEY MARKET SYSTEM\\Bond Pricing\\NCPI Index.xlsx';
const NCPI_index: any = readExcelFile(filePath);

const lastDayOfMonth = (date: Date): Date => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return new Date(date.getFullYear(), date.getMonth(), lastDay);
};

class Bond {
    couponRate: number;
    maturityDate: Date;
    frequency: number;
    bookCloseDays: number;

    constructor(couponRate: number, maturityDate: Date, frequency: number, bookCloseDays: number) {
        this.couponRate = couponRate;
        this.maturityDate = maturityDate;
        this.frequency = frequency;
        this.bookCloseDays = bookCloseDays;
    }

    couppcd(settlementDate: Date): Date {
        const couponInterval = 12 / this.frequency;
        let previousCouponDate = new Date(this.maturityDate);

        while (previousCouponDate > settlementDate) {
            previousCouponDate.setMonth(previousCouponDate.getMonth() - couponInterval);
        }

        return previousCouponDate;
    }

    coupncd(settlementDate: Date): Date {
        const couponInterval = 12 / this.frequency;
        let previousCouponDate = new Date(this.maturityDate);

        while (previousCouponDate > settlementDate) {
            previousCouponDate.setMonth(previousCouponDate.getMonth() - couponInterval);
        }

        previousCouponDate.setMonth(previousCouponDate.getMonth() + couponInterval);
        return previousCouponDate;
    }

    coupnum(settlementDate: Date): number {
        let periods = 0;
        let currentDate = new Date(settlementDate);

        while (currentDate < this.maturityDate) {
            currentDate.setMonth(currentDate.getMonth() + 12 / this.frequency);
            periods += 1;
        }

        return periods - 1;
    }

    bookClose(settlementDate: Date): Date {
        const nextCouponDate = this.coupncd(settlementDate);
        return new Date(nextCouponDate.getFullYear(), nextCouponDate.getMonth(), nextCouponDate.getDate() - this.bookCloseDays);
    }

    price(settlementDate: Date, yieldToMaturity: number): number {
        const previousCouponDate = this.couppcd(settlementDate);
        const nextCouponDate = this.coupncd(settlementDate);
        const bookCloseDate = this.bookClose(settlementDate);

        const daysCurrentPeriod = (nextCouponDate.getTime() - previousCouponDate.getTime()) / (1000 * 60 * 60 * 24);
        const daysSettlementToNextCoupon = (nextCouponDate.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24);

        const periodsSettlementToRedemption = this.coupnum(settlementDate);
        const periodsPreviousCouponToRedemption = periodsSettlementToRedemption + daysSettlementToNextCoupon / daysCurrentPeriod;

        if (
            settlementDate < bookCloseDate &&
            this.maturityDate.getTime() - settlementDate.getTime() > daysCurrentPeriod
        ) {
            const F = periodsSettlementToRedemption;
            const G = periodsPreviousCouponToRedemption;
            const a = yieldToMaturity / this.frequency / 100;
            const b = Math.pow(1 + a, G);
            const c = this.couponRate;
            const d = 100 / b;
            const e = c / this.frequency / 100;
            const g = e / (b * a);
            const h = (Math.pow(1 + a, F + 1) - 1) * 100;
            const p = d + g * h;
            return Math.round(p * 100000) / 100000;
        } else if (
            settlementDate > bookCloseDate &&
            this.maturityDate.getTime() - settlementDate.getTime() > daysCurrentPeriod
        ) {
            const F = periodsSettlementToRedemption;
            const G = periodsPreviousCouponToRedemption;
            const a = yieldToMaturity / this.frequency / 100;
            const b = Math.pow(1 + a, G);
            const c = this.couponRate;
            const d = 100 / b;
            const e = c / this.frequency / 100;
            const g = e / (b * a);
            const h = (Math.pow(1 + a, F) - 1) * 100;
            const p = d + g * h;
            return Math.round(p * 100000) / 100000;
        } else if (
            settlementDate < bookCloseDate &&
            this.maturityDate.getTime() - settlementDate.getTime() < daysCurrentPeriod
        ) {
            const E = daysSettlementToNextCoupon;
            const c = this.couponRate;
            const a = 100 + c / this.frequency;
            const b = 1 + (E / 365) * (yieldToMaturity / 100);
            const p = a / b;
            return Math.round(p * 100000) / 100000;
        } else {
            const E = daysSettlementToNextCoupon;
            const b = 1 + (E / 365) * (yieldToMaturity / 100);
            const p = 100 / b;
            return Math.round(p * 100000) / 100000;
        }
    }
}

// Function to format Date as a string for use as a key
const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

class InflationLinkedBond extends Bond {
    baseIndex: number;

    constructor(couponRate: number, maturityDate: Date, frequency: number, bookCloseDays: number, baseIndex: number) {
        super(couponRate, maturityDate, frequency, bookCloseDays);
        this.baseIndex = baseIndex;
    }



    inflationAdjustedPrice(settlementDate: Date, yieldToMaturity: number, NCPIIndex: any): number {
        const unadjustedPrice = this.price(settlementDate, yieldToMaturity);

        const threeMonthsAgo = new Date(settlementDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const EOMThreeMonthsAgo = lastDayOfMonth(threeMonthsAgo);
        const formattedThreeMonthsAgoDate = formatDateKey(EOMThreeMonthsAgo);
        const NCPIThreeMonthsAgo = NCPI_index[formattedThreeMonthsAgoDate];

        // const threeMonthsAgo = new Date(settlementDate);
        // threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        // const EOMThreeMonthsAgo = lastDayOfMonth(threeMonthsAgo);
        // const NCPIThreeMonthsAgo = NCPIIndex[EOMThreeMonthsAgo];

        const fourMonthsAgo = new Date(settlementDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 4);
        const EOMFourMonthsAgo = lastDayOfMonth(fourMonthsAgo);
        const formattedFourMonthsAgoDate = formatDateKey(EOMThreeMonthsAgo);
        const NCPFIFourMonthsAgo = NCPI_index[formattedFourMonthsAgoDate];

        // const fourMonthsAgo = new Date(settlementDate);
        // fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
        // const EOMFourMonthsAgo = lastDayOfMonth(fourMonthsAgo);
        // const NCPFIFourMonthsAgo = NCPIIndex[EOMFourMonthsAgo];

        const dayOfMonth = settlementDate.getDate();
        const daysInMonth = new Date(settlementDate.getFullYear(), settlementDate.getMonth() + 1, 0).getDate();
        const referenceCPI = NCPFIFourMonthsAgo + ((dayOfMonth - 1) / daysInMonth) * (NCPIThreeMonthsAgo - NCPFIFourMonthsAgo);
        const indexRatio = referenceCPI / this.baseIndex;

        return Math.round(unadjustedPrice * indexRatio * 100000) / 100000;
    }
}

// Bond Static Data
const GC23 = new Bond(8.85, new Date(2023, 9, 15), 2, 31);
const GC24 = new Bond(10.5, new Date(2024, 9, 15), 2, 31);
const GC25 = new Bond(8.5, new Date(2025, 3, 15), 2, 31);
const GC26 = new Bond(8.5, new Date(2026, 3, 15), 2, 31);
const GC27 = new Bond(8.0, new Date(2027, 0, 15), 2, 31);
const GC28 = new Bond(8.5, new Date(2028, 9, 15), 2, 31);
const GC30 = new Bond(8.0, new Date(2030, 0, 15), 2, 31);
const GC32 = new Bond(9.0, new Date(2032, 3, 15), 2, 31);
const GC35 = new Bond(9.5, new Date(2035, 6, 15), 2, 31);
const GC37 = new Bond(9.5, new Date(2037, 6, 15), 2, 31);
const GC40 = new Bond(9.8, new Date(2040, 9, 15), 2, 31);
const GC43 = new Bond(10.0, new Date(2043, 6, 15), 2, 31);
const GC45 = new Bond(9.85, new Date(2045, 6, 15), 2, 31);
const GC48 = new Bond(10.0, new Date(2048, 9, 15), 2, 31);
const GC50 = new Bond(10.25, new Date(2050, 6, 15), 2, 31);

// Inflation Linked Static Data
const GI25 = new InflationLinkedBond(3.8, new Date(2025, 6, 15), 2, 31, 111.819909583916);
const GI27 = new InflationLinkedBond(4.0, new Date(2027, 9, 15), 2, 31, 143.70987);
const GI29 = new InflationLinkedBond(4.5, new Date(2029, 0, 15), 2, 31, 126.285551233707);
const GI33 = new InflationLinkedBond(4.5, new Date(2033, 3, 15), 2, 31, 130.86294496974);
const GI36 = new InflationLinkedBond(4.8, new Date(2036, 6, 15), 2, 31, 136.729232775951);

// Tests
const settlementDate = new Date(2023, 5, 28);

// Bond Prices
GC23.price(settlementDate, 8.568);
GC30.price(settlementDate, 10.830);
GC48.price(settlementDate, 13.30025);
GC50.price(settlementDate, 13.352);

// ILB No Adjustment
GI25.price(settlementDate, 3.20);
GI27.price(settlementDate, 3.97);
GI29.price(settlementDate, 5.09);
GI33.price(settlementDate, 6.071);
GI36.price(settlementDate, 6.369);

// ILB Adjusted Prices
GI25.inflationAdjustedPrice(settlementDate, 3.20, NCPI_index);
GI27.inflationAdjustedPrice(settlementDate, 3.97, NCPI_index);
GI29.inflationAdjustedPrice(settlementDate, 5.09, NCPI_index);
GI33.inflationAdjustedPrice(settlementDate, 6.071, NCPI_index);
GI36.inflationAdjustedPrice(settlementDate, 6.369, NCPI_index);


// Bond Prices
console.log('GC23 Price:', GC23.price(settlementDate, 8.568));
console.log('GC30 Price:', GC30.price(settlementDate, 10.830));
console.log('GC48 Price:', GC48.price(settlementDate, 13.30025));
console.log('GC50 Price:', GC50.price(settlementDate, 13.352));

// ILB No Adjustment
console.log('GI25 Price:', GI25.price(settlementDate, 3.20));
console.log('GI27 Price:', GI27.price(settlementDate, 3.97));
console.log('GI29 Price:', GI29.price(settlementDate, 5.09));
console.log('GI33 Price:', GI33.price(settlementDate, 6.071));
console.log('GI36 Price:', GI36.price(settlementDate, 6.369));

// ILB Adjusted Prices
console.log('GI25 Inflation Adjusted Price:', GI25.inflationAdjustedPrice(settlementDate, 3.20, NCPI_index));
console.log('GI27 Inflation Adjusted Price:', GI27.inflationAdjustedPrice(settlementDate, 3.97, NCPI_index));
console.log('GI29 Inflation Adjusted Price:', GI29.inflationAdjustedPrice(settlementDate, 5.09, NCPI_index));
console.log('GI33 Inflation Adjusted Price:', GI33.inflationAdjustedPrice(settlementDate, 6.071, NCPI_index));
console.log('GI36 Inflation Adjusted Price:', GI36.inflationAdjustedPrice(settlementDate, 6.369, NCPI_index));

