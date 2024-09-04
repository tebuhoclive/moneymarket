import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import './Check.scss'; // Import the SCSS file

export interface IOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  options: IOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  value: string;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
  options,
  placeholder = 'Search...',
  onChange,
  value,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filterOptions = (options: IOption[], searchTerm: string) => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    return options.filter(option => {
      const cleanedLabel = option.label.toLowerCase().replace(/,/g, '').trim();
      const substrings = cleanedLabel.split(' ');
      return substrings.some(substring => substring.startsWith(searchTermLower));
    });
  };

  return (
    <div className='custom-component'>
      <Autocomplete
        className={"autocomplete"}
        value={options.find(option => option.value === value) || null}
        onChange={(event, newValue) => {
          if (newValue) {
            onChange(newValue.value);
          }
        }}
        inputValue={searchTerm}
        onInputChange={(event, newInputValue) => {
          setSearchTerm(newInputValue);
        }}
        options={filterOptions(options, searchTerm)}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField
            {...params}
            className={"autocomplete"}
            label={placeholder}
          />
        )}
        isOptionEqualToValue={(option, value) => option.value === value.value}
      />
    </div>

  );
};

export default SingleSelect;
