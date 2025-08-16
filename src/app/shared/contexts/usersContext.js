"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/utils/axios/api";

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Fetch all users, no filters, large limit
                const { data } = await api.get("/admin/users");
                setUsers(data.users || []);
            } catch (err) {
                setError(err?.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <UsersContext.Provider value={{ users, loading, error, setUsers }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = () => useContext(UsersContext);
