import React, { useState, useEffect, FC } from 'react';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { IconButton } from '@mui/material';
import './LotsSingleSelect.scss';

interface OptionType {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: OptionType[];
    onChange: (selectedOption: OptionType | null) => void;
    value?: OptionType | null;
    placeholder?: string;
    disabled?: boolean;
}

const SearchableSelect: FC<SearchableSelectProps> = ({ options, onChange, value, placeholder, disabled }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

    useEffect(() => {
        if (value) {
            setSelectedOption(value);
            setSearchTerm(value.label);
        } else {
            setSelectedOption(null);
            setSearchTerm('');
        }
    }, [value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setShowOptions(true);
    };

    const handleOptionClick = (option: OptionType) => {
        setSelectedOption(option);
        setSearchTerm(option.label);
        setShowOptions(false);
        onChange(option);
    };

    const handleClearSelection = () => {
        setSelectedOption(null);
        setSearchTerm('');
        onChange(null);
    };

    const filterAndSortOptions = (options: OptionType[], searchTerm: string): OptionType[] => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const exactMatches: OptionType[] = [];
        const prefixMatches: OptionType[] = [];
        const containsMatches: OptionType[] = [];

        options.forEach(option => {
            const lowerLabel = option.label.toLowerCase();
            if (lowerLabel === lowerSearchTerm) {
                exactMatches.push(option);
            } else if (lowerLabel.startsWith(lowerSearchTerm)) {
                prefixMatches.push(option);
            } else if (lowerLabel.includes(lowerSearchTerm)) {
                containsMatches.push(option);
            }
        });

        return [...exactMatches, ...prefixMatches, ...containsMatches];
    };

    const filteredOptions = filterAndSortOptions(options, searchTerm);

    return (
        <div className="lotsSingleSelect">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onClick={() => setShowOptions(!showOptions)}
                placeholder={placeholder || 'Select...'}
                disabled={disabled}
            />
            {selectedOption && (
                <IconButton onClick={handleClearSelection} className="clearButton">
                    <HighlightOffOutlinedIcon />
                </IconButton>
            )}
            {showOptions && (
                <ul className="optionsList">
                    {filteredOptions.map(option => (
                        <li
                            key={option.value}
                            onClick={() => handleOptionClick(option)}
                            className="option"
                        >
                            {option.label}
                        </li>
                    ))}
                    {filteredOptions.length === 0 && (
                        <li className="noOptions">
                            No options found 😧
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;
