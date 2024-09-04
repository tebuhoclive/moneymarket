import { observer } from "mobx-react-lite";
import { useState, FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { PASSWORD } from "./dialog/Dialogs";
import ForgotPasswordDialog from "./dialog/ForgotPasswordDialog";

import './LoggedOut.scss';

import { ErrorAlert } from "../../shared/components/alert/Alert";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import { useAppContext } from "../../shared/functions/Context";
import showModalFromId from "../../shared/functions/ModalShow";
import icons from "../../shared/utils/icons";
import Modal from "../../shared/components/Modal";

const style = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const Loader = () => {
  return (
    <div style={style}>
      <LoadingEllipsis />
    </div>
  );
};

type ILocationState = {
  from: string;
};

const LoggedOut = observer(() => {

  const { api, store } = useAppContext();

  const location = useLocation();
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });

  const [loading, setLoading] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);

  const forgotPassword = () => {
    showModalFromId(PASSWORD.FORGOT_PASSWORD_DIALOG)
  };


  const onSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { email, password = "" } = signInForm;
    const $user = await api.auth.signIn(email, password);

    if (!$user) {
      setUserNotFoundError(true)
      setLoading(false);
      return;
    }
  };

  if (store.auth.loading) return <Loader />;

  if (!store.auth.loading && store.auth.me) {
    const state = location.state as ILocationState;

    if (state) return <Navigate to={state.from} />;
    return <Navigate to="/c/dashboard" />;
  }

  return (
    <ErrorBoundary>
      <div className="logged-out">
        <div className="uk-grid">
          <div className="uk-width-expand">
            <div className="login-text uk-text-center">
              <img src={icons.IJG} alt="" className="logo" />
              <h1>Money Market System</h1>
            </div>

          </div>

          <div className="uk-width-1-4">

            <div className="login uk-card uk-card-body">
              {userNotFoundError && (
                <ErrorAlert msg="Invalid login details. Please ensure you have entered the correct login details or contact the System Administrator if issue persists"
                  onClose={() => setUserNotFoundError(false)}
                />
              )}
              <h4 className="main-title-sm">System User Login</h4>
              <form className="uk-form-stacked uk-child-width-3-4" onSubmit={onSignIn}>
                <div className="uk-margin">
                  <label className="uk-form-label" htmlFor="user-login-email">
                    Email
                  </label>
                  <div className="uk-form-controls">
                    <input className="uk-input" id="user-login-email" type="email" placeholder="Email" value={signInForm.email} onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value, })}
                      required
                    />
                  </div>
                </div>
                <div className="uk-margin uk-inline">
                  <label className="uk-form-label" htmlFor="user-login-password">
                    Password
                  </label>
                  <div className="uk-form-controls">
                    <input className={`uk-input ${userNotFoundError ? 'uk-input-invalid' : ''}`} id="user-login-password" type="password" placeholder="Password" value={signInForm.password} onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value, })} required />
                  </div>
                </div>
                <div className="uk-margin">
                  <div className="controls">
                    <div className="uk-grid uk-width-1-1 uk-grid-small" data-uk-grid>
                      <div className="uk-width-1-2">
                        <button className="btn btn-primary uk-width-1-1" type="submit" >
                          Login
                          {loading && (<div className="uk-margin-small-left" data-uk-spinner="ratio: 0.5" />)}
                        </button>
                      </div>
                      <div className="uk-width-1-2">
                        <button className="btn btn-primary uk-width-1-1"
                          type="button"
                          onClick={forgotPassword} >
                          Reset Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Modal modalId={PASSWORD.FORGOT_PASSWORD_DIALOG}>
        <ForgotPasswordDialog />
      </Modal>
    </ErrorBoundary>
  );
});

export default LoggedOut;
