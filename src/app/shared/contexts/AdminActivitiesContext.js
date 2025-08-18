import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/utils/axios/api";

const AdminActivitiesContext = createContext();

export const AdminActivitiesProvider = ({ children }) => {
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchActivities = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await api.get("/admin/activities");
			setActivities(response.data.activities || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchActivities();
	}, [fetchActivities]);

	return (
		<AdminActivitiesContext.Provider value={{ activities, setActivities, loading, error, fetchActivities }}>
			{children}
		</AdminActivitiesContext.Provider>
	);
};

export const useAdminActivities = () => useContext(AdminActivitiesContext);
