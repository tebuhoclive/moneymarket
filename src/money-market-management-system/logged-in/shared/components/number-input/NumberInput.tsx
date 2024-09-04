import { useEffect, useState } from "react";
import NumberFormat from "react-number-format";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";

interface INumberInputProps {
  id?: string;
  className?: string;
  placeholder?: string;
  value: string | number | null;
  onChange: (value: string | number) => void;
  max?: number;
  min?: number;
  required?: boolean;
  disabled?: boolean;
  decimalScale?: number;
}

const NumberInput = (props: INumberInputProps) => {
  const {
    id,
    className,
    value,
    max,
    min,
    placeholder,
    required,
    disabled,
    onChange,
  } = props;

  const [_value, _setValue] = useState<number | null | string>(value ?? "");
  const [_nan, _setNaN] = useState(false);
  const _className = _nan ? `${className}` : `${className}`;

  /**
   * Returns the value of the input
   */
  const handleChange = (values: any) => {
    const val = values.floatValue;
    const inputValue = values.value;
    console.log("Values ", val)
    // Check if the input value is greater than zero
    const validInput = typeof val === "number" && val > 0;
    _setNaN(!validInput && required === true);

    if (val !== undefined && validInput) {
      if (max && val > max) {
        _setValue(max);
        onChange(max);
      } else if (min && val < min) {
        _setValue(min);
        onChange(min);
      } else {
        _setValue(val);
        onChange(val);
      }
    } else {
      _setValue("");
      onChange("");
    }
  };

  useEffect(() => {
    if (value !== _value) {
      _setValue(value ?? "");
    }
  }, [value]);

  return (
    <ErrorBoundary>
      <div className="">
        <NumberFormat
          id={id}
          className={_className}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          thousandsGroupStyle="thousand"
          displayType="input"
          decimalSeparator="."
          type="text"
          value={_value !== null ? _value : ""}
          onValueChange={handleChange}
          thousandSeparator
          allowNegative={false}
          min={min}
          max={max}
          decimalScale={2} // Set decimal scale to 2
        />
      </div>
    </ErrorBoundary>
  );
};

export default NumberInput;
