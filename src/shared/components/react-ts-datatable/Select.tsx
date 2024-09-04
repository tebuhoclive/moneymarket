import { HandlePageSizing } from "./DataTableTypes";

interface SelectProps {
  options: number[];
  handlePageSizing: HandlePageSizing;
}

export const Select = ({ options, handlePageSizing }: SelectProps) => {
  return (
    <div className="uk-flex uk-form-controls">
      <label className="uk-form-label uk-margin-small-top uk-margin-small-right " htmlFor="entries">
        Show
      </label>
      <select
        className="uk-select uk-form-small"
        name="entries"
        id="entries"
        onChange={(e) => handlePageSizing(parseInt(e.currentTarget.value, 10))}
        defaultValue={options[0]}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <label className="uk-form-label uk-margin-small-top uk-margin-small-left" htmlFor="entries">
        Records
      </label>
    </div>
  );
};
