import React from 'react';
import Select, { SingleValue } from 'react-select';

type Option = {
  label: string;
  value: string;
};
interface CustomSelectProps {
  options: Option[];
  oldOptions?:Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isRtl?: boolean;
  name?: string;
  isClearable?: boolean;
  required?: boolean;
}
const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    fontSize: '12px',
    backgroundColor: state.isFocused ? '#004C98' : provided.backgroundColor,
    color: state.isFocused ? '#ffffff' : provided.color,
  }),
  control: (provided: any) => ({
    ...provided,
    minHeight: '28px',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    fontSize: '14px',
  }),
};
const customFilter = (option: Option, inputValue: string) => {
  const optionLabel = option.label.toLowerCase();
  const inputLower = inputValue.toLowerCase();
  const inputCharacters = inputLower.split('');
  return inputCharacters.every(char => optionLabel.includes(char));
};
const SingleSelect: React.FC<CustomSelectProps> = ({
  options,
  oldOptions,
  value,
  onChange,
  placeholder = 'Select...',
  isSearchable = true,
  isDisabled = false,
  isLoading = false,
  isRtl = false,
  isClearable = true,
  required = false,
  name
}) => {
  const handleChange = (selectedOption: SingleValue<Option>) => {
    onChange(selectedOption ? selectedOption.value : "");
  };
  const getValue = (): Option | null => {
    if (!value) return null;
    if(oldOptions){
      const selectedOption = oldOptions?.find(option =>
        option.value === value
      );
      return selectedOption || null;
    }else{
      const selectedOption = options?.find(option =>
        option.value === value
      );
      return selectedOption || null;
    }
  };
  return (
    <Select<Option>
      className="single-select"
      classNamePrefix="select"
      options={options}
      value={getValue()}
      onChange={handleChange}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isRtl={isRtl}
      name={name ?? ""}
      isClearable={isClearable}
      styles={customStyles}
      filterOption={(option, inputValue) => customFilter(option, inputValue)}
    />
  );
};

export default SingleSelect;
