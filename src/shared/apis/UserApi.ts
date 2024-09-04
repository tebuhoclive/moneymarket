import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut,
  deleteUser,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";

import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import swal from "sweetalert";
import { auth, db, authWorker } from "../config/firebase-config";
import { IUser } from "../models/User";

export default class UserApi {
  constructor(private api: AppApi, private store: AppStore) {
    this.onAuthChanged();
  }

  onAuthChanged() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.onSignedIn(user.uid);
      } else {
        await this.onSignedOut();
      }
    });
  }

  private async onSignedIn(uid: string) {
    this.store.user.loading = true;
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      this.store.user.loading = false;
      return;
    }
    const user = { uid: userDoc.id, ...userDoc.data() } as IUser;
    this.store.user.loadCurrentUser(user);
    this.store.user.loading = false;
  }

  private async onSignedOut() {
    this.store.user.loading = true;
    this.store.user.removeCurrentUser();
    this.store.user.loading = false;
  }

  // User will be created with authWorker, thus not signed-in

  async create(user: IUser) {
    const { email } = user;
    const userCredential = await createUserWithEmailAndPassword(
      authWorker,
      email,
      "@ijg2024"
    ).catch((error) => {
      return null;
    });

    if (userCredential) {
      const newUser = { ...user, uid: userCredential.user.uid }; // Include UID in user object
      await setDoc(doc(db, "users", newUser.uid), newUser); // Use the UID as the document ID
      this.store.user.load([newUser]);
      console.log("Api Created User", newUser);
      return newUser;
    } else {
      // Handle error
      return null;
    }
  }

  // Update user info
  async update(user: IUser) {
    console.log("user: ", user);

    try {
      await setDoc(doc(db, "users", user.uid), user);
    } catch (error) {
      console.log("error: ", error);
      return;
    }
    this.store.user.load([user]);
    return user;
  }

  async signIn(email: string, password: string) {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      })
      .catch((error) => {
        return null;
      });

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((error) => {
      return null;
    });

    if (userCredential) return userCredential.user;
    return userCredential;
  }

  async signOutUser() {
    signOut(auth);
  }

  async removeUser(user: User) {
    await deleteUser(user);
    await this.deleteUserFromDB(user.uid);
    return;
  }

  async passwordResetWithEmail(email: string) {
    await sendPasswordResetEmail(auth, email)
      .then(function () {
        swal("Password reset email sent.");
      })
      .catch(function (error) {
        swal("Could not send email.");
      });
  }

  async passwordResetWithOldPassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ) {
    const credential = EmailAuthProvider.credential(email, oldPassword);
    const user = auth.currentUser;
    if (!user) return;
    await reauthenticateWithCredential(user, credential)
      .then(() => {
        if (newPassword.length >= 6)
          // User re-authenticated.
          updatePassword(user, newPassword)
            .then(function () {
              // Update successful.
              swal("Password reset successfully");
            })
            .catch(function (error) {
              // An error happened.
              swal("Could not reset password");
            });
        else swal("Password should be atleast 6 characters long");
      })
      .catch((error) => {
        // An error happened.
        swal("Incorrect password");
      });
  }

  async getById(uid: string) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const user = { ...docSnap.data(), uid: docSnap.id } as IUser;
      this.store.user.load([user]);
      return user;
    } else return undefined;
  }

  async deleteUserFromDB(uid: string) {
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
  }

  async getAll() {
    this.store.user.removeAll();
    const $query = query(collection(db, "users"), orderBy("firstName"));
    const querySnapshot = await getDocs($query);
    const users = querySnapshot.docs.map((doc) => {
      return { ...doc.data(), uid: doc.id } as IUser;
    });
    this.store.user.load(users);
  }
}
