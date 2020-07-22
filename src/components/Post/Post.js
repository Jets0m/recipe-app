import React, { useState, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import { db } from "../../firebase";
import firebase from "firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { IconButton, Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";

import { makeStyles } from "@material-ui/core/styles";

import "./Post.scss";
import OpenPost from "../OpenPost/OpenPost";

function Post({
  imageUrl,
  username,
  caption,
  postId,
  user,
  title,
  ingredients,
  method,
  likes,
}) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [likeList, setlikeList] = useState([]);

  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              comment: doc.data(),
            }))
          );
        });
    }

    return () => {
      unsubscribe();
    };
  }, [postId]);

  const postComment = (e) => {
    e.preventDefault();
    db.collection("posts").doc(postId).collection("comments").add({
      text: comment,
      username: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    setComment("");
  };

  let isUser = false;

  if (user) {
    isUser = username === user.displayName;
  }

  const deletePost = () => {
    db.collection("posts").doc(postId).delete();
  };

  const handlePostClickOpen = () => {
    setPostOpen(true);
  };

  const handlePostClose = () => {
    setPostOpen(false);
  };

  const useStyles = makeStyles({
    addBtn: {
      position: "absolute",
      right: "2rem",
      bottom: "2rem",
    },
    imageContainer: {
      position: "relative",
    },
  });

  const extraContent = (
    <div>
      {comments.map(({ id, comment }) => (
        <p key={id}>
          <span className="comment__username">{comment.username}</span>
          <span className="comment__text">{comment.text}</span>
        </p>
      ))}
    </div>
  );

  const likeRef = db.collection("posts").doc(postId);

  const handleLike = () => {
    likeRef.get().then((doc) => {
      if (doc.exists) {
        const previousLikes = doc.data().likes;
        const prevUserLikes = doc
          .data()
          .likes.filter((like) => like.likedBy.id == user.uid);
        if (prevUserLikes == 0) {
          const like = { likedBy: { id: user.uid, name: user.displayName } };
          const updatedLikes = [...previousLikes, like];
          likeRef.update({ likes: updatedLikes });
        } else {
          console.log(prevUserLikes);
        }
      }
    });
  };

  const linkName = readMore ? "Hide comments" : "View comments";

  const classes = useStyles();

  return (
    <div className="post">
      <header className="post__header">
        <div className="post__headerText">
          <Avatar
            className="post__avatar"
            alt={username}
            src="/broken-image.jpg"
          />
          <div className="post__username">{username}</div>
        </div>
        {isUser && (
          <>
            <IconButton
              aria-label="delete"
              className="post__headerText"
              onClick={deletePost}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </header>
      <div className={classes.imageContainer}>
        <img className="post__image" src={imageUrl} alt="post_image" />
        <Fab
          color="primary"
          aria-label="add"
          onClick={handlePostClickOpen}
          className={classes.addBtn}
          size="small"
        >
          <AddIcon />
        </Fab>
      </div>

      <div className="post__text">
        <span className="post__title">{title}</span>
        <span className="post__caption">{caption}</span>
        <span className="post__likes">
          <IconButton
            aria-label="like"
            className="post__headerText"
            onClick={handleLike}
            size="small"
          >
            <FavoriteIcon fontSize="small" />
          </IconButton>
          {likes ? likes?.length : 0}{" "}
          {likes?.length === 1 ? "person likes" : "people like"} this
        </span>
      </div>
      <div className="post__comments">
        <a
          className={`read-more-link ${comments.length === 0 && "hide"}`}
          onClick={() => {
            setReadMore(!readMore);
          }}
        >
          <p>{linkName}</p>
        </a>
        <div className="post__commentsList">{readMore && extraContent}</div>
        {user && (
          <form className="post__commentsForm">
            <input
              type="text"
              className="post__commentInput"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="post__commentButton"
              disabled={!comment}
              type="submit"
              onClick={postComment}
            >
              Post
            </button>
          </form>
        )}
      </div>
      <Dialog
        open={postOpen}
        onClose={handlePostClose}
        aria-labelledby="form-dialog-title"
      >
        <OpenPost
          title={title}
          caption={caption}
          image={imageUrl}
          username={username}
          postId={postId}
          user={user}
          ingredients={ingredients}
          method={method}
        />
      </Dialog>
    </div>
  );
}

export default Post;
