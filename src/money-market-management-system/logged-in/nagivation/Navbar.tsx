import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Dropdown from "../../../shared/components/dropdown/Dropdown";
import { useAppContext } from "../../../shared/functions/Context";
import icons from "../../../shared/utils/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

const Navbar = observer(() => {
  const { api, store, ui } = useAppContext();
  const navigate = useNavigate();
  const THEME_KEY = "theme";
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || ":root");

  const me = store.auth.meJson;
  const name = me ? me.displayName || " " : " ";
  const initials = name.split(" ").map((name) => name[0]).join("");

  const handleLogOut = () => {
    api.auth.onSignedOut();
  };

  const navigateBack = () => {
    if (ui.backPath) navigate(ui.backPath);
    else navigate(-1);
    ui.hideBackButton();
  };

  const handleToggle = () => {
    const body = document.body;
    body.classList.toggle("dark");
    setTheme(body.classList.contains("dark") ? "dark" : ":root");
  };

  const toProfile = () => {
    navigate("/c/profile")
  }

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="sticky" data-uk-sticky="sel-target: .uk-navbar; cls-active: uk-navbar-sticky">
      <nav className="ijg-navbar" data-uk-navbar>
        <div className="uk-navbar-left uk-hidden@s">
          <button
            className="uk-navbar-toggle"
            data-uk-navbar-toggle-icon
            data-uk-toggle="target: #navbar-drawer"
          ></button>
        </div>
        <div className="navbar-title uk-navbar-left uk-margin-left">
          <h4 className="main-title-sm uk-margin-left">
            <FontAwesomeIcon
              icon={faArrowLeftLong}
              onClick={navigateBack}
            ></FontAwesomeIcon>{ui.title} Back
          </h4>
        </div>
        <div className="uk-navbar-center">
          <div className="uk-grid uk-grid-small" data-grid>
            <label className="switch">
              <input type="checkbox" onChange={handleToggle} checked={theme === "dark"} />
              <span className="slider round"></span>
            </label>
            <label className="switch-label">Theme Selector
              {theme === ":root" ? "  ☀️" : "  🌙"}
            </label>
          </div>
        </div>

        <div className="navbar-right uk-navbar-right">
          <ul className="uk-navbar-nav">
            <li className="avatar-li-item">
              <p className="avatar-username">
                <span className="name">{me?.displayName}</span>
                <br />
                <span className="job-title">{me?.jobTitle || "Unknown"}</span>
              </p>
              <button className="user-avatar">
                <img src={icons.user} alt={initials} width="24" height="24" data-uk-svg />
              </button>
              <Dropdown>
                <li>
                  <button
                    className="kit-dropdown-btn"
                    onClick={toProfile}
                  >
                    <span
                      className="uk-margin-small-right"
                      data-uk-icon="settings"
                    ></span>
                    Profile
                  </button>
                  <button className="kit-dropdown-btn" onClick={handleLogOut}>
                    <span
                      className="uk-margin-small-right"
                      data-uk-icon="sign-out"
                    ></span>
                    Sign out
                  </button>
                </li>
              </Dropdown>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
});

export default Navbar;
