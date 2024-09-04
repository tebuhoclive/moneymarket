import React, { useState, useEffect } from "react";

interface IProps {
    amount: number,
    onAmountChange: any,
    disabled?: boolean;
}

const FormattedNumberInput = ({ amount, onAmountChange, disabled = false }: IProps) => {
    const [formattedAmount, setFormattedAmount] = useState(amount.toLocaleString());

    useEffect(() => {
        setFormattedAmount(amount.toLocaleString());
    }, [amount]);

    const handleChange = (e: any) => {
        const value = e.target.value.replace(/,/g, ""); // Remove commas for parsing
        const numberValue = Number(value);

        // Update the actual amount state in the parent component
        onAmountChange(numberValue);

        // Update the formatted value state
        setFormattedAmount(numberValue.toLocaleString());
    };

    return (
        <input
            disabled={disabled}
            className="auto-save uk-input purchase-input uk-form-small"
            placeholder="-"
            type="text" // Use text type to display formatted value
            value={formattedAmount}
            onChange={handleChange}
        />
    );
};

export default FormattedNumberInput;
