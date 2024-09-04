import { Fragment } from 'react';
import { HandlePageChange } from 'react-ts-datatable/dist/types';
import { PageButton } from './PageButton';

interface PaginationListProps {
  firstPage: number;
  lastPage: number;
  page: number;
  pageList: number[];
  suspendAfterList: boolean;
  suspendBeforeList: boolean;
  handlePageChange: HandlePageChange;
}

export const PaginationList = ({
  firstPage,
  lastPage,
  page,
  pageList,
  suspendAfterList,
  suspendBeforeList,
  handlePageChange,
}: PaginationListProps) => {
  return (
    <Fragment>
      {suspendBeforeList && (
        <Fragment>
          <li key={firstPage}>
            <PageButton page={firstPage} handlePageChange={handlePageChange} />
          </li>
          <li key={'suspendedBeforeList'}>
          <span className="uk-margin-small-right" data-uk-icon="more"></span>
          </li>
        </Fragment>
      )}
      {pageList.length > 0 &&
        pageList.map((pageNumber) => (
          <li key={pageNumber} className={pageNumber === page ? 'current uk-button' : ''}>
            {pageNumber === page ? (
              <span>{pageNumber}</span>
            ) : (
              <PageButton
                page={pageNumber}
                handlePageChange={handlePageChange}
              />
            )}
          </li>
        ))}
      {suspendAfterList && (
        <Fragment>
          <li key={'suspendedAfterList'}>
            <span className="uk-margin-small-right" data-uk-icon="more"></span>
          </li>
          <li key={lastPage}>
            <PageButton page={lastPage} handlePageChange={handlePageChange} />
          </li>
        </Fragment>
      )}
    </Fragment>
  );
};
