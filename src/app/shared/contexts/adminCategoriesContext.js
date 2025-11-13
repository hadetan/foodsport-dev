import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "@/utils/axios/api";

const AdminCategoriesContext = createContext();

export const AdminCategoriesProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/products/categories');
            setCategories(response.data.categories || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    const getCategoryById = useCallback((id) => {
        if (!id) return null;
        const strId = String(id);
        return categories.find((c) => {
            const candidates = [c?.id, c?.categoryId, c?.uuid];
            return candidates.some((v) => v != null && String(v) === strId);
        });
    },
        [categories]
    );

    const getCategoryNameById = useCallback((id) => {
        const c = getCategoryById(id);
        return c?.name ?? "";
    },
        [categories]
    )

    return (
        <AdminCategoriesContext.Provider
            value={{
                categories, setCategories, loading, error, fetchCategories, getCategoryById, getCategoryNameById
            }}
        >
            {children}
        </AdminCategoriesContext.Provider>
    )
};

export const useAdminCategories = () => useContext(AdminCategoriesContext);