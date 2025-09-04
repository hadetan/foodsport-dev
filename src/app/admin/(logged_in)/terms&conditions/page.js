"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const TiptapEditor = dynamic(
    () => import("@/app/shared/components/TiptapEditor"),
    {
        ssr: false,
    }
);

function TncModal({ open, onClose, onSave, initial, loading }) {
    const [title, setTitle] = useState(initial?.title || "");
    const [description, setDescription] = useState(initial?.description || "");

    useEffect(() => {
        setTitle(initial?.title || "");
        setDescription(initial?.description || "");
    }, [initial, open]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div
                className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg relative flex flex-col"
                style={{ maxHeight: "90vh" }}
            >
                <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-lg font-semibold mb-4">
                    {initial ? "Edit TNC" : "Create TNC"}
                </h2>
                <label className="block mb-2 font-medium">Title</label>
                <input
                    className="w-full border px-3 py-2 rounded mb-4"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                />
                <label className="block mb-2 font-medium">Description</label>
                <div className="flex-1 mb-4 overflow-y-auto">
                    <TiptapEditor
                        value={description}
                        onChange={setDescription}
                        editable={!loading}
                        className="w-full h-full"
                    />
                </div>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={async () => {
                        if (!title.trim() || !description.trim()) {
                            alert("Title and description are required.");
                            return;
                        }
                        try {
                            const res = await axios.post("/api/admin/tnc", {
                                title,
                                description,
                            });
                            if (res.status !== 201) {
                                alert(
                                    res.data?.error || "Failed to create TNC"
                                );
                                return;
                            }
                            onClose();
                        } catch (e) {
                            alert(
                                e?.response?.data?.error ||
                                    "Failed to create TNC"
                            );
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? "Saving..." : initial ? "Update" : "Create"}
                </button>
            </div>
        </div>
    );
}

function TncReadModal({ open, onClose, tnc }) {
    if (!open || !tnc) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500"
                    onClick={onClose}
                >
                    &times;
                </button>
                <h2 className="text-xl font-bold mb-2">{tnc.title}</h2>
                <div className="text-xs text-gray-500 mb-2">
                    Created by: {tnc.createdBy || "N/A"} | Updated by:{" "}
                    {tnc.updatedBy || "N/A"}
                </div>
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: tnc.description }}
                />
            </div>
        </div>
    );
}

export default function TermsAndConditionsPage() {
    const [tncs, setTncs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [readModalOpen, setReadModalOpen] = useState(false);
    const [selectedTnc, setSelectedTnc] = useState(null);
    const [editTnc, setEditTnc] = useState(null);
    const [error, setError] = useState("");

    async function fetchTncs() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/tnc");
            const data = await res.json();
            if (res.ok) setTncs(data.tncs || []);
            else setError(data.error || "Failed to fetch TNCs");
        } catch (e) {
            setError("Failed to fetch TNCs");
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchTncs();
    }, []);

    async function handleSave({ title, description }) {
        setLoading(true);
        setError("");
        try {
            const method = editTnc ? "PATCH" : "POST";
            const url = editTnc
                ? `/api/admin/tnc?id=${encodeURIComponent(editTnc.id)}`
                : "/api/admin/tnc";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to save");
                setLoading(false);
                return;
            }
            setModalOpen(false);
            setEditTnc(null);
            fetchTncs();
        } catch (e) {
            setError("Failed to save");
        }
        setLoading(false);
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => {
                        setModalOpen(true);
                        setEditTnc(null);
                    }}
                >
                    + Create
                </button>
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="bg-white rounded shadow">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3">Title</th>
                            <th className="p-3">Created By</th>
                            <th className="p-3">Updated By</th>
                            <th className="p-3">Created At</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tncs.map((tnc) => (
                            <tr
                                key={tnc.id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td
                                    className="p-3 cursor-pointer text-blue-700 underline"
                                    onClick={() => {
                                        setSelectedTnc(tnc);
                                        setReadModalOpen(true);
                                    }}
                                >
                                    {tnc.title}
                                </td>
                                <td className="p-3">{tnc.createdBy || "-"}</td>
                                <td className="p-3">{tnc.updatedBy || "-"}</td>
                                <td className="p-3">
                                    {new Date(tnc.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        onClick={() => {
                                            setEditTnc(tnc);
                                            setModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tncs.length === 0 && !loading && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-4 text-center text-gray-500"
                                >
                                    No TNCs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {loading && <div className="p-4 text-center">Loading...</div>}
            </div>
            <TncModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditTnc(null);
                    setError("");
                }}
                onSave={handleSave}
                initial={editTnc}
                loading={loading}
            />
            <TncReadModal
                open={readModalOpen}
                onClose={() => {
                    setReadModalOpen(false);
                    setSelectedTnc(null);
                }}
                tnc={selectedTnc}
            />
        </div>
    );
}
