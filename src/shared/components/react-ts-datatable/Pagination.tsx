import { paginationWithSuspend } from 'react-ts-datatable';
import { PaginationParams, HandlePageChange } from 'react-ts-datatable/dist/types';
import { PaginationList } from './PaginationList';

interface PaginationProps {
  pagination: PaginationParams | null;
  handlePageChange: HandlePageChange;
}

export const Pagination = ({
  pagination,
  handlePageChange,
}: PaginationProps) => {
  const paginationRender = pagination
    ? paginationWithSuspend(pagination)
    : null;

  const goToPreviousPage = () => {
    if (pagination) handlePageChange(pagination.page - 1);
  };

  const goToNextPage = () => {
    if (pagination) handlePageChange(pagination.page + 1);
  };

  const isPreviousButtonDisabled =
    !pagination || pagination.page === pagination.firstPage;
  const isNextButtonDisabled =
    !pagination || pagination.page === pagination.lastPage;

  return (
    <div className="pagination uk-flex">

        <button
          onClick={goToPreviousPage}
          disabled={isPreviousButtonDisabled}
          className="pagination-nav btn btn-primary uk-margin-small-right btn-small"
        >
          Previous
        </button>

      {paginationRender && (
        <PaginationList {...paginationRender} handlePageChange={handlePageChange} />
      )}

        <button
          onClick={goToNextPage}
          disabled={isNextButtonDisabled}
          className="pagination-nav btn btn-primary uk-margin-small-left btn-small"
        >
          Next
        </button>
    </div>
  );
};
