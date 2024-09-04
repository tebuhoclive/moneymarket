import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { defaultUser, IUser } from "../../../../shared/models/User";
import MODAL_NAMES from "../ModalName";
import UserForm from "./UserForm";
import UserFeatures from "./UserFeatures";
import swal from "sweetalert";

const UserModal = observer(() => {
  const { api, store } = useAppContext();

  const [user, setUser] = useState({ ...defaultUser });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // start loading

    const _user: IUser = {
      ...user,
      displayName: `${user.firstName} ${user.lastName}`,
    }
    console.log("_user", _user);
    
    // if selected user, update
    const selected = store.user.selected;

    if (selected) await update(_user);
    else await create(_user);
    setLoading(false); // stop loading
    onCancel();
  };

  const update = async (user: IUser) => {
    try {
      await api.user.update(user);
      swal({
        icon: "success", 
        text: "User account details/permissions update successfully"
      });
      
    } catch (error) {
    }
  };

  const create = async (user: IUser) => {
    try {
      await api.user.create(user);
      swal({
        icon: "success", 
        text: "User account created successfully"
      })
    } catch (error) {
    }
  };

  const onCancel = () => {
    store.user.clearSelected();
    setUser({ ...defaultUser });
    hideModalFromId(MODAL_NAMES.ADMIN.USER_MODAL);
  };

  // if selected user, set form values
  useEffect(() => {
    if (store.user.selected) setUser({ ...store.user.selected });
    else setUser({ ...defaultUser });
  }, [store.user.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-2-3@m uk-width-1-1@s">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>

      <h4 className="uk-modal-title">User</h4>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          onSubmit={handleSubmit}
          data-uk-grid
        >
          <div className="uk-width-1-3@m uk-width-1-1@s ">
            <UserForm user={user} setUser={setUser} />
          </div>
          <div className="uk-width-expand@m uk-width-1-1@s">
            <UserFeatures user={user} setUser={setUser} />
          </div>
          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn-text uk-margin-right"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default UserModal;


// btxpnc