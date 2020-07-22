import React, { useState, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import { db } from "../../firebase";
import firebase from "firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import { IconButton, Fab } from "@material-ui/core";

import "./OpenPost.scss";

const OpenPost = ({
  title,
  caption,
  image,
  username,
  user,
  postId,
  ingredients,
  method,
}) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

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

  return (
    <div className="post__open">
      <div className="recipe__header">
        <div className="recipe__headerText">
          <Avatar
            className="recipe__avatar"
            alt={username}
            src="/broken-image.jpg"
          />
          <div className="post__username">{username}</div>
        </div>
      </div>
      <div className="recipe__details">
        <h2 className="recipe__title">{title}</h2>
        <p className="recipe__caption">{caption}</p>
        <div className="recipe__ingredients">
          <p className="recipe__heading">Ingredients</p>
          <ul className="recipe__ingredientsList">
            {ingredients.map((ingredient, i) => (
              <li key={i} className="recipe__ingredientItem">
                <span className="recipe__ingredientQuantity">
                  {ingredient.quantity}
                </span>
                <span className="recipe__ingredientName">
                  {ingredient.ingredient}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="recipe__method">
          <p className="recipe__heading">Method</p>
          <ol className="recipe__ingredientsList">
            {method.map((method, i) => (
              <li key={i} className="recipe__ingredientItem">
                <span>{method.method}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="recipe__image">
        <img src={image} alt={title} />
      </div>
      <div className="recipe__comments">
        <p className="recipe__commentsTitle">Comments</p>
        <div className="post__commentsList recipe__commentsList">
          {comments.map(({ id, comment }) => (
            <p key={id}>
              <span className="comment__username">{comment.username}</span>
              <span className="comment__text">{comment.text}</span>
              {/* Delete comments not working */}
              {/* {isUser && (
                <IconButton
                  aria-label="delete"
                  className="post__headerText"
                  onClick={() => {
                    db.collection("posts")
                      .doc(postId)
                      .collection("comments")
                      .doc(id)
                      .delete();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )} */}
            </p>
          ))}
        </div>
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
    </div>
  );
};

export default OpenPost;
