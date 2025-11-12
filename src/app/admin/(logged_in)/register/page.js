"use client";
import React, { useState } from "react";
import axios from '@/utils/axios/api';
import PasswordInputClient from "@/app/shared/components/PasswordInputClient";

const RegisterPage = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
        };

        try {
            const res = await axios.post("/admin/auth/register", payload);
            setMessage({
                type: "success",
                text: res.data.message || "Registration successful.",
            });
            setForm({ name: "", id: "", password: "" });
        } catch (err) {
            setMessage({
                type: "error",
                text:
                    err.response?.data?.error ||
                    err.message ||
                    "Registration failed.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Register New Admin</h1>
            {message && (
                <div
                    className={`alert mb-4 ${message.type === "error"
                            ? "alert-error"
                            : "alert-success"
                        }`}
                >
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium" htmlFor="name">
                        Name
                    </label>
                    <input
                        className="input input-bordered w-full"
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="input input-bordered w-full"
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label
                        className="block mb-1 font-medium"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <PasswordInputClient
                        className="input input-bordered w-full"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;
