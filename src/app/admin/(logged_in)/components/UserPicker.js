import React, { useState } from "react";
import { useUsers } from "@/app/shared/contexts/usersContext";

const UserPicker = ({ selectedUsers, setSelectedUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { users, loading } = useUsers();

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 1) {
      setSearchResults([]);
      return;
    }

    const filteredUsers = users.filter(
      (user) =>
        (user.name?.toLowerCase().includes(term.toLowerCase()) ||
          user.email?.toLowerCase().includes(term.toLowerCase())) &&
        !selectedUsers.some((selected) => selected.email === user.email)
    );

    setSearchResults(filteredUsers.slice(0, 10));
  };

  const selectUser = (user) => {
    if (!selectedUsers.some((selected) => selected.email === user.email)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const addEmail = () => {
    const email = searchTerm.trim();
    if (
      isValidEmail(email) &&
      !selectedUsers.some((u) => u.email === email)
    ) {
      setSelectedUsers([
        ...selectedUsers,
        { id: email, name: email, email },
      ]);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  return (
    <div className="form-control w-full">
      <div className="relative flex items-center gap-2 ">
        <input
          type="text"
          placeholder="Search users email to send to"
          className="input input-bordered input-l w-48 rounded-[8px]"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              isValidEmail(searchTerm.trim())
            ) {
              e.preventDefault();
              addEmail();
            }
          }}
        />
        {loading && (
          <div className="absolute right-3 top-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}
      </div>
      {searchResults.length > 0 && (
        <ul className="menu bg-base-100 shadow-lg rounded-box w-64 max-h-64 overflow-y-auto absolute z-10 mt-1 border border-base-800">
          {searchResults.map((user, idx) => (
            <li
              key={user.id}
              className={
                idx !== searchResults.length - 1
                  ? "border-b border-base-800"
                  : ""
              }
            >
              <a
                onClick={() => selectUser(user)}
                className="hover:bg-base-200 focus:bg-base-200 px-4 py-2 cursor-pointer flex flex-col"
              >
                <span className="font-semibold">
                  {user.name}
                </span>
                <span className="text-sm opacity-70">
                  {user.email}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserPicker;
