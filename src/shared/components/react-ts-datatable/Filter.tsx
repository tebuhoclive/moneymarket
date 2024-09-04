import { HandleFiltering } from "./DataTableTypes";

interface FilterProps {
  handleFiltering: HandleFiltering;
}
export const Filter = ({ handleFiltering }: FilterProps) => {
  return (
    <div className="uk-flex">
      <label className="uk-form-label uk-margin-small-top uk-margin-small-right" htmlFor="search">Search:</label>
      <input className="uk-input uk-form-small uk-width-large" type="search" id="search" onChange={(e) => handleFiltering(e.currentTarget.value)} />
    </div>
  );
};
