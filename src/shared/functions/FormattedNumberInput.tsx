import React, { useState, useEffect } from "react";
import "./FormattedNumberInput.scss";
import NumberFormat from "react-number-format";
import { numberFormat } from "./Directives";
interface IProps {
    amount: number;
    onAmountChange: (amount: number) => void;
    disabled?: boolean;
    showFormat?: boolean;
}

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const FormattedNumberInput = ({ amount, onAmountChange, disabled = false, showFormat = true }: IProps) => {
    const [inputValue, setInputValue] = useState(amount.toFixed(2));
    const [formattedValue, setFormattedValue] = useState(formatNumber(amount));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setInputValue(amount.toFixed(2));
            setFormattedValue(formatNumber(amount));
        }
    }, [amount, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/,/g, ''); // Remove commas for parsing
        setInputValue(value);

        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            onAmountChange(numberValue);
            setFormattedValue(formatNumber(numberValue));
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        setInputValue(inputValue.replace(/,/g, '')); // Remove formatting on focus
    };

    const handleBlur = () => {
        setIsFocused(false);
        const numberValue = parseFloat(inputValue);
        if (!isNaN(numberValue)) {
            setInputValue(numberFormat(numberValue));
            setFormattedValue(numberFormat(numberValue));
        } else {
            setInputValue(numberFormat(amount));
            setFormattedValue(numberFormat(amount));
        }
    };

    return (
        <div>
            <input
                disabled={disabled}
                placeholder="-"
                type="text" // Use text type to display formatted value
                defaultValue={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            {showFormat === true &&
                <label
                    className="uk-form-label"
                    style={{ fontSize: "10px", marginLeft: "9px" }}
                    htmlFor="amount">
                    NAD {formattedValue}
                </label>
            }
        </div>
    );
};

export default FormattedNumberInput;
