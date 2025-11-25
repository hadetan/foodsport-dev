import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "@/utils/axios/api";

const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBadges = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/admin/badges");
            setBadges(response.data.badges || []);
        } catch (err) {
            console.error("Error fetching badges:", err);
            setError(err.message);
            // Set empty array on error to prevent breaking the UI
            setBadges([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    const getBadgeById = useCallback(
        (id) => {
            if (!id) return null;
            const strId = String(id);
            return badges.find((badge) => {
                return badge?.id && String(badge.id) === strId;
            });
        },
        [badges]
    );

    const getBadgeNameById = useCallback(
        (id) => {
            const badge = getBadgeById(id);
            return badge?.name ?? "";
        },
        [getBadgeById]
    );

    return (
        <BadgeContext.Provider
            value={{
                badges,
                setBadges,
                loading,
                error,
                fetchBadges,
                getBadgeById,
                getBadgeNameById,
            }}
        >
            {children}
        </BadgeContext.Provider>
    );
};

export const useBadges = () => useContext(BadgeContext);
