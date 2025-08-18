import React from "react";
import { MdClose } from "react-icons/md";
import "./UsersDropdown.css";

export default function UsersDropdown({ users, onRemove }) {
  return (
    <div className="users-dropdown-list">
      {users.map((user) => (
        <div className="users-dropdown-pill" key={user.id}>
          <span className="users-dropdown-email">{user.email}</span>
          <button
            className="users-dropdown-remove"
            title="Remove"
            onClick={() => onRemove(user.id)}
            type="button"
          >
            <MdClose />
          </button>
        </div>
      ))}
    </div>
  );
}
