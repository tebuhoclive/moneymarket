import * as xlsx from 'xlsx';

class StaticBond {
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

    getPreviousCouponDate(tradeDate: Date): Date {
        const couponInterval = 12 / this.frequency;
        let previousCouponDate = new Date(this.maturityDate);

        while (previousCouponDate > tradeDate) {
            previousCouponDate.setMonth(previousCouponDate.getMonth() - couponInterval);
        }

        return previousCouponDate;
    }

    getNextCouponDate(tradeDate: Date): Date {
        const couponInterval = 12 / this.frequency;
        let previousCouponDate = new Date(this.maturityDate);

        while (previousCouponDate > tradeDate) {
            previousCouponDate.setMonth(previousCouponDate.getMonth() - couponInterval);
        }

        previousCouponDate.setMonth(previousCouponDate.getMonth() + couponInterval);
        return previousCouponDate;
    }

    getNumberOfCompletedCoupons(tradeDate: Date): number {
        let periods = 0;
        let currentDate = new Date(tradeDate);

        while (currentDate < this.maturityDate) {
            currentDate.setMonth(currentDate.getMonth() + 12 / this.frequency);
            periods += 1;
        }

        return periods - 1;
    }

    getBookClose(tradeDate: Date): Date {
        const nextCouponDate = this.getNextCouponDate(tradeDate);
        return new Date(nextCouponDate.getFullYear(), nextCouponDate.getMonth(), nextCouponDate.getDate() - this.bookCloseDays);
    }

    price(settlementDate: Date, yieldToMaturity: number): number {
        const previousCouponDate = this.getPreviousCouponDate(settlementDate);
        const nextCouponDate = this.getNextCouponDate(settlementDate);
        const bookCloseDate = this.getBookClose(settlementDate);

        const daysCurrentPeriod = (nextCouponDate.getTime() - previousCouponDate.getTime()) / (1000 * 60 * 60 * 24);
        const daysSettlementToNextCoupon = (nextCouponDate.getTime() - settlementDate.getTime()) / (1000 * 60 * 60 * 24);

        const periodsSettlementToRedemption = this.getNumberOfCompletedCoupons(settlementDate);
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

    // Add this function for calculating accrued interest excluding the next coupon
    calculateAccruedInterestEx(tradeDate: Date): number {
        const accruedInterestEx = 0; // Placeholder, replace with actual logic
        console.log('Accrued Interest (Ex):', accruedInterestEx);
        return accruedInterestEx;
    }

    // Add this function for calculating accrued interest including the next coupon
    calculateAccruedInterestCumulative(tradeDate: Date): number {
        const accruedInterestCumulative = 0; // Placeholder, replace with actual logic
        console.log('Accrued Interest (Cumulative):', accruedInterestCumulative);
        return accruedInterestCumulative;
    }

    // Add this function for calculating clean price excluding accrued interest
    calculateCleanPriceEx(tradeDate: Date, yieldToMaturity: number): number {
        const accruedInterestEx = this.calculateAccruedInterestEx(tradeDate);
        const cleanPriceEx = this.price(tradeDate, yieldToMaturity) - accruedInterestEx;

        return Math.round(cleanPriceEx * 100000) / 100000;
    }

    // Add this function for calculating clean price including accrued interest
    calculateCleanPriceCumulative(tradeDate: Date, yieldToMaturity: number): number {
        const accruedInterestCumulative = this.calculateAccruedInterestCumulative(tradeDate);
        const cleanPriceCumulative = this.price(tradeDate, yieldToMaturity) - accruedInterestCumulative;

        return Math.round(cleanPriceCumulative * 100000) / 100000;
    }
}

// Bond Static Data (unchanged)

const tradeDate = new Date(2023, 12, 7);

// Create an instance of StaticBond
const GC32 = new StaticBond(9.0, new Date(2032, 3, 15), 2, 31);

// Calculate accrued interest excluding the next coupon
const accruedInterestEx = GC32.calculateAccruedInterestEx(tradeDate);
console.log('Accrued Interest (Ex):', accruedInterestEx);

// Calculate accrued interest including the next coupon
const accruedInterestCumulative = GC32.calculateAccruedInterestCumulative(tradeDate);
console.log('Accrued Interest (Cumulative):', accruedInterestCumulative);

// Calculate clean price excluding accrued interest
const cleanPriceEx = GC32.calculateCleanPriceEx(tradeDate, 10.5); // replace with actual YTM
console.log('Clean Price (Ex):', cleanPriceEx);

// Calculate clean price including accrued interest
const cleanPriceCumulative = GC32.calculateCleanPriceCumulative(tradeDate, 10.5); // replace with actual YTM
console.log('Clean Price (Cumulative):', cleanPriceCumulative);
