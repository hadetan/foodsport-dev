import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const VerifiedAttendeesContext = createContext();

export function useVerifiedAttendees() {
    return useContext(VerifiedAttendeesContext);
}

export function VerifiedAttendeesProvider({ children }) {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <VerifiedAttendeesContext.Provider
            value={{ attendees, loading, error, setAttendees, setLoading, setError }}
        >
            {children}
        </VerifiedAttendeesContext.Provider>
    );
}
