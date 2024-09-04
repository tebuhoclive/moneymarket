import Select, { SingleValue } from "react-select";
import ErrorBoundary from "../error-boundary/ErrorBoundary";
import { useEffect } from "react";

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
  options: IOption[];
  groupedOptions?: IGroupedOption[];
  width?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  hideSelectedOptions?: boolean;
  valueOption?: IOption;
  onChange: (value: string) => void;
}

const SingleSelectInitial = (props: IProps) => {
  const {
    isClearable = true,
    isLoading = false,
    isSearchable = true,
    required = false,
    hideSelectedOptions = false,
    options,
    groupedOptions,
    name = "",
    width = "100%",
    placeholder = "Search...",
    value,
    onChange,
  } = props;

  const formatGroupLabel = (data: IGroupedOption) => (
    <div className="grouped-label">
      <span>{data.label}</span>
      <span className="grouped-badge">{data.options.length}</span>
    </div>
  );

  const getValue = (): IOption | undefined => {
    if (hideSelectedOptions || !value) return undefined;
    return options.find((option) => option.value === value);
  };
  
  const handleChange = (current: SingleValue<string | IOption>, actionMeta: any) => {
    if (actionMeta.action === "clear" || hideSelectedOptions) {
      onChange("");
    } else if (current) {
      onChange((current as IOption).value);
    }
  };

  
  useEffect(() => {
    if (hideSelectedOptions) {
      onChange("");
    }
  }, [hideSelectedOptions, onChange]);
  
  if (groupedOptions)
    return (
      <ErrorBoundary>
        <div style={{ width }}>
          <ErrorBoundary>
            <Select<IOption, false, IGroupedOption>
              className="single-select"
              classNamePrefix="select"
              isLoading={isLoading}
              isClearable={isClearable}
              isSearchable={isSearchable}
              defaultValue={options[1]}
              onChange={handleChange}
              value={getValue()}
              name={name}
              options={groupedOptions}
              formatGroupLabel={formatGroupLabel}
              placeholder={placeholder}
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <div id="hidden-input">
              <input
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
            value={getValue()}
            name={name}
            options={options}
            placeholder={placeholder}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <div id="hidden-input">
            <input
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

export default SingleSelectInitial;

