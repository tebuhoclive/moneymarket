import React from 'react';
import SearchableSelect from '../../../money-market-management-system/logged-in/shared/components/client-account-select-component/LotsSingleSelect';

interface IDateProps {
    startDate: Date;
    endDate: Date;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    SearchableSelect?: React.FC<SearchableSelectProps>;
    searchableSelectProps?: SearchableSelectProps;
}
interface SearchableSelectProps {
    options: OptionType[];
    onChange: (selectedOption: OptionType | null) => void;
    value?: OptionType | null;
    placeholder?: string;
}

interface OptionType {
    value: string;
    label: string;
}
const StartDateEndDate = (props: IDateProps) => {
    return (
        <div className="uk-width-2-3 uk-flex uk-margin" style={{ display: "flex",flexDirection:"row", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center",width:"65%" }}>
            {props.searchableSelectProps && (
                <div style={{display:"flex",flexDirection:"column",width:"100%"}}>
                    <label  className="uk-form-label" style={{ marginRight: "1rem" }}>Select Account:</label>
                    <SearchableSelect {...props.searchableSelectProps} />
                </div>
            )}
        </div>
        <div className="uk-margin">
            <label className="uk-form-label" htmlFor="startDate">
                Period Start:
            </label>
            <input
                className="uk-input uk-form-small"
                type="date"
                id="startDate"
                value={props.startDate.toISOString().substr(0, 10)}
                onChange={(e) => props.setStartDate(new Date(e.target.value))}
            />
        </div>
        <div className="uk-margin-left">
            <label className="uk-form-label" htmlFor="endDate">
                Period End:
            </label>
            <input
                className="uk-input uk-form-small"
                type="date"
                id="endDate"
                value={props.endDate.toISOString().substr(0, 10)}
                onChange={(e) => props.setEndDate(new Date(e.target.value))}
            />
        </div>
    </div>
    
    );
};

export default StartDateEndDate;
