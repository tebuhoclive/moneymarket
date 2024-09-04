import AppStore from "../stores/AppStore";

import { defaultUser, IUser } from "../models/User";
import AppApi from "./AppApi";
import {
    signInWithPopup,
    OAuthProvider,
    signOut,
    signInWithRedirect,
    UserCredential,
    onAuthStateChanged,
    User as FirebaseUser,
    browserSessionPersistence,
    setPersistence,
} from "firebase/auth";
import { auth, db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";

// tenant: "fa3d3433-ec90-43bd-b8c9-a5f517b44e05", unknown
// tenant: "1b6be874-fce1-4662-9955-6f8e64efbc5a", // lots

const GRAPH_API_ENDPOINTS = {
    ME: "https://www.docfoxapp.com/api/v2/tokens/new",
};


// http://www.ftp.saix.net/linux/distributions/centos/8-stream/isos/x86_64/CentOS-Stream-8-20230517.0-x86_64-boot.iso
export default class DocfoxAuthApi {
    private provider = new OAuthProvider("docfoxapp.com");

    constructor(private api: AppApi, private store: AppStore) {
        this.provider.setCustomParameters({
            login_hint: "user@lotsinsights.com",
            tenant: "1b6be874-fce1-4662-9955-6f8e64efbc5a",
        });

        this.provider.addScope("mail.read");
        this.provider.addScope("calendars.read");
        this.handleAuthStateChange();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async loginDox(endpoint: string, token: string) {
        const headers = new Headers();
        const bearer = `Bearer ${token}`;
        headers.append("Authorization", bearer);
        // headers.append('Accept:', 'application/vnd.api+json');
        // headers.append('X-Client-Api-Key:', '5075UuVARblZePwWDAjoqQx63PRyM8mKP6H1DjAPpd2O8EOWc6zLSiOlJGitDxxW1AQ');

        const options = {
            method: "GET",
            headers: headers,
        };

        const response = await fetch(endpoint, options);
        const userInfo = await response.json();

        try {
            return userInfo;
        } catch (error) {
            // console.error(error);
        }
    }

    async loginAuth() {
        try {
            // const response = await axios.get('https://www.docfoxapp.com/api/v2/authentications/new', {
            //     headers: {
            //         'Accept': 'application/vnd.api+json',
            //         'X-Client-Api-Key': '5075UuVARblZePwWDAjoqQx63PRyM8mKP6H1DjAPpd2O8EOWc6zLSiOlJGitDxxW1AQ',
            //         'Secret': '72AE9386-F90C-4D24-A728-F2ADB4AC7B2C',
            //         'CORS': 'Access-Control-Allow-Origin',
            //     },
            // });

            // Handle the response data
            // console.log(response.data);
            const accessToken = "72AE9386-F90C-4D24-A728-F2ADB4AC7B2C"

            await this.getUserInfoDox(accessToken);
        } catch (error) {
            // Handle errors
            console.error(error);
        }
    };


    private async getUserInfoDox(accessToken: string) {
        try {
            const userInfo = await this.loginDox(
                GRAPH_API_ENDPOINTS.ME,
                accessToken
            );
            return userInfo;
        } catch (error) {
            console.log(error);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





    private handleAuthStateChange() {
        onAuthStateChanged(auth, async (user) => {
            this.store.auth.setLoading(true); // start loading.
            if (!user) {
                this.logOut();
                this.store.auth.setLoading(false); // start loading.
                return;
            }

            try {
                this.handleUserBasicInfo(user);
                // this.handleUserCredential(cred); // Get user info from graph api.
            } catch (error) {
                // console.log("Error: ", error);
                this.logOut();
            }
        });
    }

    async logInWithPopup() {
        try {
            await setPersistence(auth, browserSessionPersistence);
            const cred = await signInWithPopup(auth, this.provider);
            await this.handleUserCredential(cred);
        } catch (error) {
            // Handle error.
            // console.log("Error: ", error); pop-up closed error
        }
    }

    async logInWithRedirect() {
        await setPersistence(auth, browserSessionPersistence);
        signInWithRedirect(auth, this.provider);
    }

    private async handleUserCredential(result: UserCredential) {
        // User is signed in.
        // Get the OAuth access token and ID Token
        const credential = OAuthProvider.credentialFromResult(result);
        if (!credential) {
            this.logOut(); // no user credentials, logOut user.
            return;
        }

        // accessToken & idToken
        const { accessToken = "" } = credential;

        // handle authenticated user
        const user = result.user;

        // get user info
        const userInfo = await this.getUserInfo(accessToken);
        const additionalUserInfo = {
            email: userInfo.mail || userInfo.userPrincipalName,
            jobTitle: userInfo.jobTitle || "",
        };

        // handle user basic info
        await this.handleUserBasicInfo(user, additionalUserInfo);
    }

    private async handleUserBasicInfo(
        user: FirebaseUser,
        additionalUserInfo: any = {}
    ) {
        // get doc
        try {
            const $doc = await getDoc(doc(db, "users", user.uid));

            // update db if user is not exist || has not logged in before.
            if (!$doc.exists()) {
                // user basic info
                const me: IUser = {
                    ...defaultUser,
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    isAnonymous: user.isAnonymous,
                    createdAt: user.metadata.creationTime || null,
                    lastLoginAt: user.metadata.lastSignInTime || null,
                    ...additionalUserInfo,
                };

                this.api.user.create(me); // TODO: optimize
                this.store.auth.logIn(me); // update current user store
            } else {
                // user basic info
                const me: IUser = {
                    ...defaultUser,
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified,
                    isAnonymous: user.isAnonymous,
                    createdAt: user.metadata.creationTime || null,
                    lastLoginAt: user.metadata.lastSignInTime || null,
                    ...$doc.data(),
                    ...additionalUserInfo,
                };
                this.api.user.create(me); // TODO: optimize
                this.store.auth.logIn(me); // update current user store
            }

            this.store.auth.setLoading(false); // start loading.
        } catch (error) {
            // throw new Error("Failed to sign-in");
            // console.log(error); //firebase
        }
    }

    private async getUserInfo(accessToken: string) {
        try {
            const userInfo = await this.callGraphApi(
                GRAPH_API_ENDPOINTS.ME,
                accessToken
            );
            return userInfo;
        } catch (error) {
            // console.log(error);
        }
    }

    private async callGraphApi(endpoint: string, token: string) {
        const headers = new Headers();
        const bearer = `Bearer ${token}`;
        headers.append("Authorization", bearer);
        const options = {
            method: "GET",
            headers: headers,
        };

        const response = await fetch(endpoint, options);
        const userInfo = await response.json();

        try {
            return userInfo;
        } catch (error) {
            // console.error(error);
        }
    }


    // logout
    async logOut() {
        try {
            await signOut(auth);
        } catch (error) {
            // console.log("Error, sign-out failed.");
        }

        // Remove user from store.
        this.store.auth.logOut();
    }
}



// import axios from "axios";
// import crypto from "crypto";
// import { createHmac } from 'crypto';
// function generateHmacSha256(nonce: string, secretKey: string): string {
//     // Convert the secret key and nonce to buffers
//     const secretKeyBuffer = Buffer.from(secretKey, 'utf-8');
//     const messageBuffer = Buffer.from(nonce, 'utf-8');
//     // Generate the HMAC using SHA-256
//     const hmac = crypto.createHmac('sha256', secretKeyBuffer);
//     hmac.update(messageBuffer);
//     // Get the hexadecimal representation of the HMAC
//     const hmacSha256 = hmac.digest('hex');
//     return hmacSha256;
// }

        // const endpoint = ('https://www.docfoxapp.com/api/v2/authentications/new');
        // const headers = new Headers({
        //     // 'Accept': 'application/vnd.api+json',
        //     // 'X-Client-Api-Key': '5075UuVARblZePwWDAjoqQx63PRyM8mKP6H1DjAPpd2O8EOWc6zLSiOlJGitDxxW1AQ',
        //     // 'Access-Control-Allow-Origin': '*'
        // },
        // );
        // const options = {
        //     method: "GET",
        //     headers: headers,
        // };
        
    // const clientKey = "5075UuVARblZePwWDAjoqQx63PRyM8mKP6H1DjAPpd2O8EOWc6zLSiOlJGitDxxW1AQ";
    // const secretKey = "72AE9386-F90C-4D24-A728-F2ADB4AC7B2C";
    // const authEndpoint = "/api/v2/tokens/new";
    // const handleSendRequest = async () => {
    //     try {
    //         const response = await fetch(authEndpoint, {
    //             method: 'GET',
    //             headers: {
    //                 'Accept': 'application/vnd.api+json',
    //                 'X-Client-Api-Key': clientKey,
    //                 'Access-Control-Allow-Origin': '*',
    //                 'Host': 'https://www.docfoxapp.com',
    //                 'Access-Control-Request-Method': 'GET',
    //                 'Access-Control-Request-Headers': 'content-type',
    //                 'Referer': 'http://localhost:3000/',
    //                 'Origin': ' http://localhost:3000',
    //             },
    //         });
    //         const data = await response.json();
    //         console.log(data);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };
    // const fetchData = async () => {
    //     try {
    //         const response = await axios.get('https://www.docfoxapp.com/api/v2/authentications/new', {
    //             headers: {
    //                 'X-Client-Api-Key': clientKey,
    //                 'Accept': 'application/vnd.api+json',
    //                 'Access-Control-Allow-Origin': '*',
    //                 'Host': 'https://www.docfoxapp.com',
    //                 'Access-Control-Request-Method': 'GET',
    //                 'Access-Control-Request-Headers': 'content-type',
    //                 'Referer': 'http://localhost:3000/',
    //                 'Origin': ' http://localhost:3000',
    //                 'Access-Control-Allow-Credentials': true
    //             },
    //         });
    //         console.log(response.data);
    //         // const clientSignature = generateHmacSha256(response.data.nonce, secretKey);
    //         // const respo = await axios.get('https://www.docfoxapp.com/api/v2/tokens/new', {
    //         //     headers: {
    //         //         'Accept': 'application/vnd.api+json',
    //         //         'X-Client-Api-Key': clientKey,
    //         //         'X-Client-Signature': clientSignature,
    //         //     },
    //         // });
    //         // console.log(respo);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };