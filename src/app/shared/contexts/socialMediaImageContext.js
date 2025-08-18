import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/utils/axios/api";

const SocialMediaImageContext = createContext();

export const SocialMediaImageProvider = ({ children }) => {
	const [images, setImages] = useState([]);
	const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

	const fetchImages = useCallback(async () => {
		try {
            setLoading(true)
			const response = await api.get("/admin/social");
			if (Array.isArray(response.data.images)) {
				setImages(response.data.images);
			} else {
				setImages([]);
			}
            setLoading(false);
		} catch (err) {
			setError(err.message || "Failed to fetch images");
		}
	}, []);

	useEffect(() => {
		fetchImages();
	}, [fetchImages]);

	const updateImageById = (id, newImage) => {
		setImages((prev) => prev.map((img) => (img.id === id ? newImage : img)));
	};

	return (
		<SocialMediaImageContext.Provider value={{ images, setImages, error, setError, fetchImages, updateImageById, loading }}>
			{children}
		</SocialMediaImageContext.Provider>
	);
};

export const useSocialMediaImages = () => useContext(SocialMediaImageContext);
