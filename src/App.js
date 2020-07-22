import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import Post from "./components/Post/Post";
import Modal from "@material-ui/core/Modal";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Input } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AddRecipe from "./components/AddRecipe/AddRecipe";
import { Switch, Route, Link } from "react-router-dom";

import "./App.scss";
import Profile from "./components/Profile/Profile";

function App() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [openSignIn, setOpenSignIn] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, username]);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: "absolute",
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: "0px solid #ff0000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(3, 4, 3),
    },
  }));

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  const signUp = (e) => {
    e.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((error) => alert(error.message));

    setOpen(false);
  };

  const signIn = (e) => {
    e.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setOpenSignIn(false);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="app">
      {user && <AddRecipe username={user.displayName} />}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={`${classes.paper} app__modalInner`}>
          <form className="app__signUp">
            <h2 className="logo">Recipegram</h2>
            <Input
              type="text"
              className="app__input"
              placeholder="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
            <Input
              type="email"
              className="app__input"
              placeholder="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Input
              type="password"
              className="app__input"
              placeholder="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <Button onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={`${classes.paper} app__modalInner`}>
          <form className="app__signUp">
            <h2 className="logo">Recipegram</h2>
            <Input
              type="email"
              className="app__input"
              placeholder="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Input
              type="password"
              className="app__input"
              placeholder="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <Button onClick={signIn}>Log In</Button>
          </form>
        </div>
      </Modal>
      <div className="app__header">
        <h2 className="logo">
          <Link to="/">Recipegram</Link>
        </h2>

        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem>
            <Link to={user && `/profile/${user.uid}`}>Profile</Link>
          </MenuItem>
          {/* <MenuItem>Favourites</MenuItem> */}
          <MenuItem
            onClick={() => {
              auth.signOut();
              handleMenuClose();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
        {user ? (
          <div className="app__loggedInContainer">
            <p>Hi {user.displayName}!</p>
            <Avatar
              className="app__avatar"
              alt={user.displayName}
              src="/broken-image.jpg"
              onClick={handleMenuClick}
            />
          </div>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={setOpenSignIn}>Log In</Button>
            <Button onClick={handleOpen}>Sign Up</Button>
          </div>
        )}
      </div>
      <Switch>
        <Route path="/" exact>
          <div className="app__posts">
            {posts.map(({ id, post }) => (
              <Post
                key={id}
                postId={id}
                user={user}
                imageUrl={post.imageUrl}
                username={post.username}
                caption={post.caption}
                title={post.title}
                ingredients={post.ingredients}
                method={post.method}
                likes={post.likes}
              />
            ))}
          </div>
        </Route>

        <Route path="/profile/:id">{user && <Profile user={user} />}</Route>
      </Switch>
    </div>
  );
}

export default App;
