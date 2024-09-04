import React, { useState, useEffect } from "react";
import Select, { SingleValue } from "react-select";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import "./SingleSelect.scss";

export interface IOption {
  value: string;
  label: string;
  color?: string;
  isDisabled?: boolean;
}

export interface IGroupedOption {
  label: string;
  options: IOption[];
}

interface IProps {
  readonly isClearable?: boolean;
  readonly isLoading?: boolean;
  readonly isSearchable?: boolean;
  required?: boolean;
  hideSelectedOptions?: boolean;

  valueOption?: IOption;
  options: IOption[];
  groupedOptions?: IGroupedOption[];
  width?: string;
  name?: string;
  placeholder?: string;
  value?: string;

  onChange: (value: string) => void;
  onCloseForm?: () => void; // Add onCloseForm prop
}

const SingleSelect = (props: IProps) => {
  const {
    isClearable = true,
    isLoading = false,
    isSearchable = true,
    required = false,
    hideSelectedOptions = false,
    options,
    groupedOptions,
    width = "100%",
    name = "",
    placeholder = "Search...",
    value,
    onChange,
    onCloseForm, // Destructure onCloseForm prop
  } = props;

  const [selectedValue, setSelectedValue] = useState<string | undefined>(value);

  useEffect(() => {
    if (onCloseForm) {
      setSelectedValue(undefined); // Reset selected value when form is closed
    }
  }, [onCloseForm]);

  const formatGroupLabel = (data: IGroupedOption) => (
    <div className="grouped-label">
      <span>{data.label}</span>
      <span className="grouped-badge">{data.options.length}</span>
    </div>
  );

  const handleChange = (current: SingleValue<IOption>, actionMeta: any) => {
    if (!current && actionMeta && actionMeta.action === "clear") {
      setSelectedValue(undefined);
      onChange("");
    }
    if (current) {
      setSelectedValue(current.value);
      onChange(current.value);
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ width }}>
        <ErrorBoundary>
          <Select
            className="single-select"
            classNamePrefix="select"
            isLoading={isLoading}
            isClearable={isClearable}
            isSearchable={isSearchable}
            hideSelectedOptions={hideSelectedOptions}
            onChange={handleChange}
            value={options.find(option => option.value === selectedValue)}
            name={name}
            options={groupedOptions || options}
            formatGroupLabel={formatGroupLabel}
            placeholder={placeholder}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <div id="hidden-input">
            <input
              className="uk-select"
              title="Select option"
              id={`single-select-${name}`}
              defaultValue={value}
              type="text"
              required={required}
            />
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default SingleSelect;
