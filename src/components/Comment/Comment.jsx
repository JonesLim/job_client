import React, { useState } from "react";
import {
  ListGroupItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { getToken } from "../../utils/helpers";
import jwt_decode from "jwt-decode";
import { EditCommentForm } from "../forms/CommentForm/EditCommentForm";
import { useMutation, useQueryClient } from "react-query";
import { deleteComment } from "../../api/comments";
import Swal from "sweetalert2";
import { ScaleLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faEdit,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

export function Comment({ comment }) {
  const [editing, setEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  const token = getToken();
  const decoded = token ? jwt_decode(token) : null;

  const deleteConfirmationMessage =
    "Are you sure you want to delete this comment? This action cannot be undone.";

  const { mutate, isLoading } = useMutation(deleteComment, {
    onSuccess: (data) => {
      Swal.fire("Deleted!", data.msg, "success");
      queryClient.invalidateQueries("comments");
    },
    onError: (err) => {
      Swal.fire("Oops...", err.response.data.msg, "error");
    },
  });

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: deleteConfirmationMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        let id = comment._id;
        mutate({ id, token });
      }
    });
  };

  if (!decoded) {
    console.log("Decoded user not available:", decoded);
    return null; // or some other fallback UI, e.g. a message to log in or reload the page
  }

  // console.log("Comment user:", comment.user);
  // console.log("Decoded user ID:", decoded.data._id);

  return (
    <ListGroupItem className="d-flex justify-content-between align-items-center">
      {editing ? (
        <EditCommentForm
          comment={comment}
          token={token}
          setEditing={setEditing}
        />
      ) : (
        <p className="mb-0">{comment.content}</p>
      )}
      {comment.user === decoded.data._id ? (
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle color="link" size="sm" className="p-0">
            <FontAwesomeIcon icon={faEllipsisV} />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={() => setEditing(true)}>
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit
            </DropdownItem>
            <DropdownItem onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
              {isLoading ? <ScaleLoader color="#fff" size={12} /> : "Delete"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : null}
    </ListGroupItem>
  );
}
