import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "@/utils/axios/api";

const AdminProductsContext = createContext();

export const AdminProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data.products || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, []);

    const getProductById = useCallback((id) => {
        if (!id) return null;
        const strId = String(id);
        return products.find((p) => {
            const candidates = [p?.id, p?.productId, p?.uuid];
            return candidates.some((v) => v != null && String(v) === strId);
        });
    },
        [products]
    );

    const getProductNameById = useCallback((id) => {
        const p = getProductById(id);
        return p?.title ?? "";
    },
        [products]
    )

    return (
        <AdminProductsContext.Provider
            value={{
                products, setProducts, loading, error, fetchProducts, getProductById, getProductNameById
            }}
        >
            {children}
        </AdminProductsContext.Provider>
    )
};

export const useAdminProducts = () => useContext(AdminProductsContext);