import { observer } from "mobx-react-lite";
import { useState, FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { PASSWORD } from "./dialog/Dialogs";
import ForgotPasswordDialog from "./dialog/ForgotPasswordDialog";
import Modal from "../../shared/components/Modal";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import { useAppContext } from "../../shared/functions/Context";
import showModalFromId from "../../shared/functions/ModalShow";
import icons from "../../shared/utils/icons";
import KeyIcon from '@mui/icons-material/Key';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLogginLoading] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const forgotPassword = () => {
    showModalFromId(PASSWORD.FORGOT_PASSWORD_DIALOG)
  };


  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if caps lock is on
    setSignInForm({ ...signInForm, password: value });
  };

  const onTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogginLoading(true);
    const { email, password = "" } = signInForm;
    const $user = await api.auth.signIn(email, password);

    if (!$user) {
      setUserNotFoundError(true)
      setLogginLoading(false);
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
        <div className="login-container uk-grid uk-grid-small" data-uk-grid>
          <div className="uk-width-2-3 login-logo uk-text-center">
            <img src={icons.IJG} alt="" className="logo" />
          </div>
          <div className="uk-width-expand login-form">
            <h4 className="main-title-lg uk-text-center">System User Login</h4>
            <hr />
            <form className="uk-form uk-form-stacked uk-grid" data-uk-grid onSubmit={onSignIn}>
              <div className="uk-form-controls uk-width-1-1">
                <label className="uk-form-label required" htmlFor="user-login-email">Email</label>
                <input className="uk-input" id="user-login-email" type="email" placeholder="Email" value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="uk-form-controls uk-width-1-1">
                <label className="uk-form-label required" htmlFor="user-login-password">Password</label>
                <div className="password-input-container">
                  <input className={`uk-input ${userNotFoundError ? 'uk-input-invalid' : ''}`} id="user-login-password" type={showPassword ? "text" : "password"} placeholder="Password" value={signInForm.password}
                    onChange={handlePasswordChange}
                    required
                    onKeyUp={handleKeyUp}
                  />
                  <button type="button" className="password-toggle" onClick={onTogglePasswordVisibility}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {capsLockOn && <small className="uk-text-danger">Caps lock is on!</small>}
              </div>
              {userNotFoundError &&
                <div className="uk-margin-top">
                  <small className="uk-text-danger">Invalid login details. Contact the System Administrator if the issue persists!</small>
                </div>
              }
              <div className="uk-form-controls uk-width-1-1">
                <button className="btn btn-primary uk-width-1-1" type="submit">
                  Login {loading && <div className="uk-margin-small-left" data-uk-spinner="ratio: 0.5" />}
                </button>
                <button className="btn btn-warning uk-width-1-1 uk-margin-small-top" type="button" onClick={forgotPassword}>
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div >
      <Modal modalId={PASSWORD.FORGOT_PASSWORD_DIALOG}>
        <ForgotPasswordDialog />
      </Modal>
    </ErrorBoundary >
  );
});

export default LoggedOut;
