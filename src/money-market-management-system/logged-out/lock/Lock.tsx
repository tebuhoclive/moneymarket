import { observer } from "mobx-react-lite";
import "./lock.scss";
import { useEffect, useState } from "react";
import { LoadingEllipsis } from "../../../shared/components/loading/Loading";
import { useAppContext } from "../../../shared/functions/Context";
import { useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThLarge } from "@fortawesome/free-solid-svg-icons";
import KeyIcon from '@mui/icons-material/Key';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const LockPage = observer(() => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
    const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString());
    const { api } = useAppContext();
    const navigate = useNavigate();

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const login = async (e: any) => {
        e.preventDefault();
        try {
            setIsLoggingIn(true);
            await api.auth.signIn(email, password, navigate)
        } catch (error) {
            setIsLoggingIn(false);
            return;
        }
        finally {
            setIsLoggingIn(false);
            setPassword("")
        }
    }

    useEffect(() => {
        const loadData = () => {
            const hasReloaded = localStorage.getItem('hasReloaded');
            if (!hasReloaded) {
                localStorage.setItem('hasReloaded', 'true');
                window.location.reload();
            } else {
                localStorage.removeItem('hasReloaded');
                const storedEmail = localStorage.getItem('userEmail');
                if (storedEmail) {
                    setEmail(storedEmail);
                } else {
                    console.log("No email found");
                }
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
            setCurrentDate(new Date().toLocaleDateString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="lock">
            {loadingData ? <LoadingEllipsis /> :
                <>
                    <div className="card">
                        <div className="logo-container">
                            <img src={`${process.env.PUBLIC_URL}/ijg-logo-new.png`} className="company-logo" alt="" />
                        </div>
                        <div className="clipart">
                            <p className="avatar-username">
                                <span className="name">{email.slice(0, 2)}</span>
                            </p>
                        </div>
                        <form onSubmit={login} className="form">
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyUp={handleKeyUp}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </button>
                            </div>
                            <div className="button">
                                <button type="submit" className="btn btn-primary sign-in-button">
                                    {isLoggingIn ? <>Signing In...</> : <>Sign In</>}
                                </button>
                                {capsLockOn &&
                                    <div className="caps-lock-warning">
                                        <KeyIcon />
                                        Caps Lock is on
                                    </div>}
                            </div>
                        </form>
                    </div>
                    <div className="time-date-display">
                        <div className="date-display">{currentDate}</div>
                        <div className="time-display">{currentTime}</div>
                    </div>
                </>
            }
        </div>
    );
});
