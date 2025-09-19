import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
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
            console.log('Getting all acts: ', response.data.activities)
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

    const getActivityById = useCallback(
        (id) => {
            if (!id) return null;
            const strId = String(id);
            return activities.find((a) => {
                const candidates = [a?.id, a?.activityId, a?.uuid];
                return candidates.some((v) => v != null && String(v) === strId);
            });
        },
        [activities]
    );

    const getActivityNameById = useCallback(
        (id) => {
            const a = getActivityById(id);
            return a?.name ?? a?.title ?? "";
        },
        [getActivityById]
    );
    console.log('Setting all acts: ', activities)

    return (
        <AdminActivitiesContext.Provider
            value={{
                activities,
                setActivities,
                loading,
                error,
                fetchActivities,
                getActivityById,
                getActivityNameById,
            }}
        >
            {children}
        </AdminActivitiesContext.Provider>
    );
};

export const useAdminActivities = () => useContext(AdminActivitiesContext);
