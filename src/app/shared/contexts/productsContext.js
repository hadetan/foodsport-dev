"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import api from "@/utils/axios/api";

const productsContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProductsAndCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get("/products");
            const safeProducts = Array.isArray(data?.products) ? data.products : [];
            const safeCategories = Array.isArray(data?.categories) ? data.categories : [];

            setProducts(safeProducts);
            setCategories(safeCategories);
        } catch (err) {
            setError(err?.message || "Failed to load products");
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductsAndCategories();
    }, [fetchProductsAndCategories]);

    return (
        <productsContext.Provider
            value={{ products, categories, loading, error, refetch: fetchProductsAndCategories }}
        >
            {children}
        </productsContext.Provider>
    );
};

export const useProducts = () => useContext(productsContext);