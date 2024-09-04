import React, { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../shared/functions/Context";
import './ProfilePage.scss';
import { IUser, defaultUser } from '../../../../shared/models/User';
import swal from 'sweetalert';

export const Profile = observer(() => {
    const { store, api } = useAppContext();
    const me = store.user.me || null;
    const [user, setUser] = useState<IUser>({ ...defaultUser })
    const [loadingGeneral, setLoadingGeneral] = useState(false);
    const [resetingPassword, setResetingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleGeneralSettingSave = async (e: any) => {
        e.preventDefault();

        const updatedUser: IUser = {
            uid: user.uid,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            displayName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            userVerified: user.userVerified,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            department: user.department,
            role: user.role,
            jobTitle: user.jobTitle,
            feature: user.feature,
            password: user.password
        }
        try {
            setLoadingGeneral(true);
            await api.user.update(updatedUser);
        } catch (error) { }
        finally {
            swal({
                icon: "success",
                text: "Your Profile is updated"
            });
            setLoadingGeneral(false);
            window.location.reload();
        }
    };

    const handlePasswordChange = async (e: any) => {
        e.preventDefault();
        try {
            setResetingPassword(true);
            await api.auth.passwordResetWithOldPassword(user.email, oldPassword, password)
        } catch (error) { }
        finally {
            swal({
                icon: "success",
                text: "Password reset successful"
            })
            setOldPassword("");
            setPassword("");
            setResetingPassword(false);
        }
    }

    useEffect(() => {
        const load = () => {
            if (me) {
                setUser(me.asJson)
            }
        }
        load();

    }, [])


    return (
        <div className="profile-management">
            <div className="profile-header">
                <div className="profile-picture">
                    {/* Profile picture or initials */}
                    {user.photoURL ?
                        <img src={user.photoURL} alt="profile-picture" className="profile-img" />
                        :
                        <div className="initials">{`${user.firstName?.slice(0, 1)}${user.lastName?.slice(0, 1)}`}</div>
                    }
                </div>
                <div className="profile-name">
                    <h2 className='username'>{user.firstName} {user.lastName}</h2>
                    <p>{user.email}</p>
                </div>
            </div>
            <div className="profile-section general-settings">
                <h3>General Settings</h3>
                <form onSubmit={handleGeneralSettingSave}>
                    <div className="uk-child-width-1-2@m uk-grid-small uk-grid-match" data-uk-grid>
                        <div className="form-group">
                            <label htmlFor="name">First Name</label>
                            <input
                                className='uk-input'
                                type="text"
                                value={user.firstName || ""}
                                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Last Name</label>
                            <input
                                className='uk-input'
                                type="text"
                                value={user.lastName || ""}
                                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                className='uk-input'
                                type="email"
                                disabled
                                value={user.email || ""}
                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Phone Number</label>
                            <input
                                className='uk-input'
                                type="text"
                                value={user.phoneNumber || ""}
                                onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loadingGeneral}>Save {loadingGeneral && <span data-uk-spinner={"ratio: .5"}></span>} </button>
                </form>
            </div>
            <div className="profile-section security-settings">
                <h3>Security Settings</h3>
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label htmlFor="password">Old Password</label>
                        <input
                            className='uk-input'
                            type="password"
                            id="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            className='uk-input'
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            className='uk-input'
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button disabled={password !== confirmPassword || password === "" || resetingPassword} type="submit" className="btn btn-primary">Save {resetingPassword && <span data-uk-spinner={"ratio: .5"}></span>}</button>
                </form>
            </div>
        </div>
    );
});
