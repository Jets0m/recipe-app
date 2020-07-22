import React, { useEffect } from "react";
import { db, auth } from "../../firebase";
import firebase from "firebase";

function Profile({}) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [userFavorites, setUserFavorites] = React.useState(null);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      db.collection("users")
        .doc(currentUser.uid)
        .collection("likes")
        .onSnapshot((snapshot) => {
          setUserFavorites(snapshot.docs.data);
        });

      console.log(userFavorites);
    }
  }, [currentUser]);

  console.log(currentUser?.uid);

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <p>{currentUser?.displayName}'s Profile</p>
    </div>
  );
}

export default Profile;
