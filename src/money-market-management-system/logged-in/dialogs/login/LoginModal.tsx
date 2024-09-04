import { observer } from "mobx-react-lite";
import { FormEvent, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { useLocation, Navigate } from "react-router-dom";
import { ErrorAlert } from "../../../../shared/components/alert/Alert";
import { LoadingEllipsis } from "../../../../shared/components/loading/Loading";

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

const LoginModal = observer(() => {

  const { api, store } = useAppContext();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });

  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { email, password = "" } = signInForm;

    const $user = await api.auth.signIn(email, password);

    if (!$user) {
      setUserNotFoundError(true);
      setLoading(false);
      return;
    }
  };

  if (!store.auth.loading && store.auth.me) {
    const state = location.state as ILocationState;
    if (state) return <Navigate to={state.from} />;
    return <Navigate to="properties" />;
  }

  if (store.auth.loading) return <Loader />;

  return (
    <div className="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title">Login</h3>
      <div className="dialog-content uk-position-relative">
        {userNotFoundError && (
          <ErrorAlert msg="User account doesn't exist. Contact administrator"
            onClose={() => setUserNotFoundError(false)}
          />
        )}
        <form className="uk-form-stacked uk-margin"
          onSubmit={handleSubmit}>
          <div className="uk-margin">
            <label className="uk-form-label" htmlFor="user-login-email">
              Email
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input"
                id="user-login-email"
                type="email"
                placeholder="Email"
                value={signInForm.email}
                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1 uk-inline">
            <label className="uk-form-label" htmlFor="user-login-password">
              Password
            </label>
            <div className="uk-form-controls">
              {/* <button
                type="button"
                className="icon-button uk-form-icon uk-form-icon-flip"
                onClick={togglePassword}
              >
                {passwordType === "password" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button> */}
              <input
                className="uk-input"
                id="user-login-password"
                type={passwordType}
                placeholder="Password"
                value={signInForm.password}
                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="uk-flex uk-margin">
            <div>
              <button className="uk-button uk-button-secondary uk-margin-right" type="submit" >
                Login
                {loading && (<div className="uk-margin-small-left" data-uk-spinner="ratio: 0.5" />)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export default LoginModal;