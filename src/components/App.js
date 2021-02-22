import React, { useState, useRef, Fragment } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import Dropzone from "react-dropzone";
import axios from "axios";
import { API_URL } from "../utils/constants";

const App = (props) => {
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [state, setState] = useState({ title: "", description: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const dropRef = useRef();

  const handleInputChange = (e) =>
    setState({ ...state, [e.target.name]: e.target.value });

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile(uploadedFile);
    dropRef.current.style.border = "2px dashed #e9ebeb";

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
    };
    fileReader.readAsDataURL(uploadedFile);
    setIsPreviewAvailable(uploadedFile.name.match(/\.(jpeg|jpg|png)$/));
  };

  const updateBorder = (dragState) => {
    if (dragState === "over") {
      dropRef.current.style.border = "2px solid #000";
    } else if (dragState === "leave") {
      dropRef.current.style.border = "2px dashed #e9ebeb";
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const { title, description } = state;
      if (title.trim() !== "" && description.trim() !== "") {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("title", title);
          formData.append("description", description);

          setErrorMsg("");
          await axios.post(`${API_URL}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          props.history.push("/list");
        } else {
          setErrorMsg("Please select a file to add.");
        }
      } else {
        setErrorMsg("Please enter all the field values");
      }
    } catch (error) {
      error.response && setErrorMsg(error.response.data);
    }
  };

  return (
    <Fragment>
      <Form className="search-form" onSubmit={handleOnSubmit}>
        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        <Row>
          <Col>
            <Form.Group controlId="title">
              <Form.Control
                type="text"
                name="title"
                value={state.title || ""}
                placeholder="Enter title"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="description">
              <Form.Control
                type="text"
                name="description"
                value={state.description || ""}
                placeholder="Enter description"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="upload-section">
          <Dropzone
            onDrop={onDrop}
            onDragEnter={() => updateBorder("over")}
            onDragLeave={() => updateBorder("leave")}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "drop-zone" })} ref={dropRef}>
                <input {...getInputProps()} />
                <p>Drag and drop a file OR click here to select a file</p>
                {file && (
                  <div>
                    <strong>Selected file:</strong>
                    {file.name}
                  </div>
                )}
              </div>
            )}
          </Dropzone>
          {previewSrc ? (
            isPreviewAvailable ? (
              <div className="image-preview">
                <img src={previewSrc} alt="Preview" className="preview-image" />
              </div>
            ) : (
              <div className="preview-message">
                <p>No preview available for this file.</p>
              </div>
            )
          ) : (
            <div className="preview-message">
              <p>Image preview will be shown here after selection.</p>
            </div>
          )}
        </div>
        <Button variant="primary" type="submit">
          submit
        </Button>
      </Form>
    </Fragment>
  );
};

export default App;
