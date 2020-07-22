import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyCRWoxaM7MGFplqAGO2rGcyWkQxESoLLCE",
  authDomain: "social-media-app-23092.firebaseapp.com",
  databaseURL: "https://social-media-app-23092.firebaseio.com",
  projectId: "social-media-app-23092",
  storageBucket: "social-media-app-23092.appspot.com",
  messagingSenderId: "233979341984",
  appId: "1:233979341984:web:4236a4c2deb7211ce62dc5",
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
