import { HandlePageChange } from './DataTableTypes';

interface PageButtonProps {
  page: number;
  handlePageChange: HandlePageChange;
}

export const PageButton = ({ page, handlePageChange }: PageButtonProps) => {
  return <button className="uk-icon-button uk-button-secondary uk-margin-small-right uk-button-small" onClick={() => handlePageChange(page)}>{page}</button>;
};
