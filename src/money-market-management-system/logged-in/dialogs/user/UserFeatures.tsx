import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { IUser, IFeatureAccess } from "../../../../shared/models/User";
import "./Pagination.scss";

interface IProps {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
}

const UserFeatures = observer((props: IProps) => {
  const { user, setUser } = props;

  const userFeatures = user.feature;

  console.log(userFeatures);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this as needed

  // Calculate the total number of pages
  const totalPages = Math.ceil(userFeatures.length / itemsPerPage);
  const maxVisiblePages = 5; // You can adjust this as needed

  // Handle previous page button click
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page button click
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate the range of visible page numbers
  const visiblePageRange = [];
  const startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    visiblePageRange.push(i);
  }

  const paginatedUserFeatures = userFeatures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleFeatureChange = (featureName: string, permission: string, checked: boolean) => {
    const updatedUser = { ...user };
    updatedUser.feature = user.feature.map((feature) => {
      if (feature.featureName === featureName) {
        return {
          ...feature,
          [permission]: checked,
        };
      }
      return feature;
    });

    setUser(updatedUser);
  };


  return (
    <>
      <h4 className="main-title-sm">System Feature Access</h4>

      <table className="uk-table uk-table-small table-kit">
        <thead>
          <tr>
            <th>Features</th>
            <th>Create</th>
            <th>Read</th>
            <th>Update</th>
            <th>Delete</th>
            <th>Verify</th>
            <th>Authorise</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUserFeatures.map((_feature: IFeatureAccess, index: number) => (
            <tr key={_feature.featureName}>
              <td>{_feature.featureName}</td>
              <td className="uk-text-center">
                <input
                  className="uk-checkbox"
                  type="checkbox"
                  id={_feature.featureName}
                  checked={_feature.create}
                  onChange={(e) => {
                    const { checked } = e.target;
                    handleFeatureChange(_feature.featureName, "create", checked);
                  }}
                />
              </td>
              <td className="uk-text-center">
                <input
                  className="uk-checkbox"
                  type="checkbox"
                  id={_feature.featureName}
                  checked={_feature.read}
                  onChange={(e) => {
                    const { checked } = e.target;
                    handleFeatureChange(_feature.featureName, "read", checked);
                  }}
                />
              </td>
              <td className="uk-text-center">
                <input
                  className="uk-checkbox"
                  type="checkbox"
                  id={_feature.featureName}
                  checked={_feature.update}
                  onChange={(e) => {
                    const { checked } = e.target;
                    handleFeatureChange(_feature.featureName, "update", checked);
                  }}
                />
              </td>
              <td className="uk-text-center">
                <input
                  className="uk-checkbox"
                  type="checkbox"
                  id={_feature.featureName}
                  checked={_feature.delete}
                  onChange={(e) => {
                    const { checked } = e.target;
                    handleFeatureChange(_feature.featureName, "delete", checked);
                  }}
                />
              </td>
              <td className="uk-text-center">
                {
                  typeof (_feature.verify) !== "undefined" &&

                  <input
                    className="uk-checkbox"
                    type="checkbox"
                    id={_feature.featureName}
                    checked={_feature.verify}
                    onChange={(e) => {
                      const { checked } = e.target;
                      handleFeatureChange(_feature.featureName, "verify", checked);
                    }}
                  />

                }
              </td>
              <td className="uk-text-center">
                {
                  typeof (_feature.authorise) !== "undefined" &&

                  <input
                    className="uk-checkbox"
                    type="checkbox"
                    id={_feature.featureName}
                    checked={_feature.authorise}
                    onChange={(e) => {
                      const { checked } = e.target;
                      handleFeatureChange(_feature.featureName, "authorise", checked);
                    }}
                  />

                }
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>
              <div className="uk-pagination">
                <button
                  type="button"
                  className="pagination-button"
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Next
                </button>
              </div>
            </td>

          </tr>
        </tfoot>
      </table>



    </>
  );
});

export default UserFeatures;