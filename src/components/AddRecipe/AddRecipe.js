import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import {
  Input,
  Button,
  IconButton,
  LinearProgress,
  Fab,
} from "@material-ui/core";
import firebase from "firebase";
import { db, storage } from "../../firebase";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import "./AddRecipe.scss";

const AddTransaction = ({ username }) => {
  const [open, setOpen] = useState(false);

  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [ingredientsList, setIngredientsList] = useState([
    { quantity: "", ingredient: "" },
  ]);
  const [methodList, setMethodList] = useState([{ method: "" }]);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        //error function
        console.log(error.message);
      },
      () => {
        //complete function
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              title: title,
              caption: caption,
              imageUrl: url,
              username: username,
              ingredients: ingredientsList,
              method: methodList,
              likes: [],
            });

            setProgress(0);
            setCaption("");
            setImage(null);
            setTitle("");
            handleClose();
            setIngredientsList([{ quantity: "", ingredient: "" }]);
            setMethodList([{ method: "" }]);
          });
      }
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const useStyles = makeStyles({
    addBtn: {
      position: "fixed",
      right: "2rem",
      bottom: "2rem",
    },
  });

  // handle ingredient input change
  const handleIngredientInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...ingredientsList];
    list[index][name] = value;
    setIngredientsList(list);
  };

  // handle ingredient click event of the Remove button
  const handleIngredientRemoveClick = (index) => {
    const list = [...ingredientsList];
    list.splice(index, 1);
    setIngredientsList(list);
  };

  // handle ingredient click event of the Add button
  const handleIngredientAddClick = () => {
    setIngredientsList([...ingredientsList, { quantity: "", ingredient: "" }]);
  };

  // handle method input change
  const handleMethodInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...methodList];
    list[index][name] = value;
    setMethodList(list);
  };

  // handle method click event of the Remove button
  const handleMethodRemoveClick = (index) => {
    const list = [...methodList];
    list.splice(index, 1);
    setMethodList(list);
  };

  // handle method click event of the Add button
  const handleMethodAddClick = () => {
    setMethodList([...methodList, { method: "" }]);
  };

  const classes = useStyles();

  return (
    <div className="addRecipe">
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClickOpen}
        className={classes.addBtn}
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add new Recipe</DialogTitle>
        <div className="imageUpload__form">
          <LinearProgress variant="determinate" value={progress} />
          <div className="imageUpload__formInputs">
            <Input
              type="text"
              value={title}
              placeholder="Title..."
              onChange={(e) => setTitle(e.target.value)}
              className="imageUpload__caption"
            />
            <Input
              type="text"
              value={caption}
              placeholder="Description..."
              onChange={(e) => setCaption(e.target.value)}
              className="imageUpload__caption"
            />

            {ingredientsList.map((x, i) => {
              return (
                <div className="box" key={i}>
                  <Input
                    type="text"
                    name="ingredient"
                    value={x.ingredient}
                    placeholder="Ingredient"
                    className="imageUpload__caption"
                    onChange={(e) => handleIngredientInputChange(e, i)}
                  />
                  <Input
                    type="text"
                    name="quantity"
                    value={x.quantity}
                    placeholder="Quantity"
                    className="imageUpload__caption"
                    onChange={(e) => handleIngredientInputChange(e, i)}
                  />

                  <div className="btn-box">
                    {ingredientsList.length !== 1 && (
                      <button
                        className="mr10"
                        onClick={() => handleIngredientRemoveClick(i)}
                      >
                        Remove
                      </button>
                    )}
                    {ingredientsList.length - 1 === i && (
                      <button onClick={handleIngredientAddClick}>Add</button>
                    )}
                  </div>
                </div>
              );
            })}
            {methodList.map((x, i) => {
              return (
                <div className="box" key={i}>
                  <span className="addStep">Step {i + 1}</span>
                  <Input
                    type="text"
                    name="method"
                    value={x.method}
                    placeholder="Add step..."
                    className="imageUpload__caption"
                    onChange={(e) => handleMethodInputChange(e, i)}
                  />

                  <div className="btn-box">
                    {methodList.length !== 1 && (
                      <button
                        className="mr10"
                        onClick={() => handleMethodRemoveClick(i)}
                      >
                        Remove
                      </button>
                    )}
                    {methodList.length - 1 === i && (
                      <button onClick={handleMethodAddClick}>Add</button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="upload-btn-wrapper">
              <span className={!image && "disabled"}>Image</span>
              <IconButton>
                <AttachFileIcon
                  color={image ? "primary" : "disabled"}
                  className="upload-btn"
                />
              </IconButton>
              <input type="file" onChange={handleChange} />
              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt=""
                  srcset=""
                  width="100"
                  height="100"
                />
              )}
            </div>

            <Button onClick={handleUpload} disabled={!image}>
              Upload
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AddTransaction;
