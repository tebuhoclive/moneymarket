import { observer } from "mobx-react-lite";
import { USER_ROLES } from "../../../../shared/functions/CONSTANTS";
import { useAppContext } from "../../../../shared/functions/Context";
import { IUser, UserRoles } from "../../../../shared/models/User";

interface IProps {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
}
const UserForm = observer((props: IProps) => {
  const { store } = useAppContext();

  const { user, setUser } = props;

  return (
    <>
    <h4 className="main-title-sm">User Details</h4>
      <div className="uk-width-1-1">
        <label className="uk-form-label required" htmlFor="user-first-name">
          First name
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="user-first-name"
            type="text"
            placeholder="First name"
            value={user.firstName || ""}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="uk-width-1-1">
        <label className="uk-form-label required" htmlFor="user-last-name">
          Last name
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="user-last-name"
            type="text"
            placeholder="Last name"
            value={user.lastName || ""}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="uk-width-1-1">
        <label className="uk-form-label required" htmlFor="user-email">
          Email
        </label>
        <div className="uk-form-controls">
          <input
            disabled={store.user.selected ? true : false}
            className="uk-input uk-form-small"
            id="user-email"
            type="email"
            placeholder="Email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="uk-width-1-1">
        <label className="uk-form-label" htmlFor="user-job-title">
          Job Title
        </label>
        <div className="uk-form-controls">
          <input
            className="uk-input uk-form-small"
            id="user-job-title"
            type="text"
            placeholder="Job title"
            value={user.jobTitle || ""}
            onChange={(e) => setUser({ ...user, jobTitle: e.target.value })}
          />
        </div>
      </div>
      <div className="uk-width-1-1">
        <label className="uk-form-label required" htmlFor="user-department">
          Department
        </label>
        <div className="uk-form-controls">
          <select
            className="uk-select uk-form-small"
            id="user-department"
            value={user.department}
            onChange={(e) => setUser({ ...user, department: e.target.value })}
            required
          >
            <option value="">--Select a department--</option>
            <option value="BO">Back Office</option>
            <option value="MO">Middle Office</option>
            <option value="FO">Front Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="uk-width-1-1">
        <label className="uk-form-label required" htmlFor="user-role">
          User Role
        </label>
        <div className="uk-form-controls">
          <select
            className="uk-select uk-form-small"
            id="user-role"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value as UserRoles })}
            required
          >
            <option value="">--Select a role--</option>
            <option value={USER_ROLES.ADMIN_USER}>System Administrator</option>
            <option value={USER_ROLES.SUPER_USER}>Super User</option>
            <option value={USER_ROLES.USER}>User</option>
            <option value={USER_ROLES.GUEST_USER}>Guest User</option>
          </select>
        </div>
      </div>
    </>
  );
});

export default UserForm;
