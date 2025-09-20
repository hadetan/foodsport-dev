"use client";

import React, { useEffect, useState } from "react";
import TiptapEditor from "@/app/shared/components/TiptapEditor";
import { X } from "lucide-react"; // add lucide X icon
import axios from '@/utils/axios/api';
import FullPageLoader from "../components/FullPageLoader";

// Reusable close button using lucide-react X icon
function CloseIconButton({ onClick, className = "" }) {
    return (
        <button
            className={`absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none ${className}`}
            onClick={onClick}
            aria-label="Close"
        >
            <X className="w-5 h-5" />
        </button>
    );
}

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
                className="bg-white rounded-lg p-6 w-[92%] sm:w-[90%] md:w-3/4 lg:max-w-4xl shadow-lg relative flex flex-col mx-auto"
                style={{ maxHeight: "90vh" }}
            >
                <CloseIconButton onClick={onClose} />
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
                    onClick={() => {
                        if (!title.trim() || !description.trim()) {
                            alert("Title and description are required.");
                            return;
                        }
                        // Delegate save (parent decides POST vs PATCH)
                        onSave({ title, description });
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
                <CloseIconButton onClick={onClose} />
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
            const res = await axios.get("/admin/tnc");
            const data = res.data;
            setTncs(data.tncs || []);
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to fetch TNCs");
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
            const isEdit = !!editTnc;
            const method = isEdit ? "patch" : "post";
            const url = isEdit
                ? `/admin/tnc?id=${encodeURIComponent(editTnc.id)}`
                : "/admin/tnc";

            const res = await axios({
                method,
                url,
                data: { title, description },
            });
            const data = res.data;

            const saved =
                data?.tnc ||
                data?.item ||
                data?.data ||
                (isEdit ? { ...editTnc, title, description } : null);

            if (isEdit) {
                setTncs((prev) =>
                    prev.map((t) =>
                        t.id === editTnc.id
                            ? {
                                  ...t,
                                  ...saved,
                                  title: saved?.title ?? title,
                                  description:
                                      saved?.description ?? description,
                                  updatedBy: saved?.updatedBy ?? t.updatedBy,
                              }
                            : t
                    )
                );
            } else if (saved) {
                setTncs((prev) => [
                    {
                        ...saved,
                        title: saved?.title ?? title,
                        description: saved?.description ?? description,
                    },
                    ...prev,
                ]);
            } else {
                setTncs((prev) => [
                    {
                        title,
                        description,
                        createdBy: "—",
                        updatedBy: "—",
                    },
                    ...prev,
                ]);
            }

            setModalOpen(false);
            setEditTnc(null);
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to save");
        }
        setLoading(false);
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Terms & Conditions</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                    onClick={() => {
                        setModalOpen(true);
                        setEditTnc(null);
                    }}
                >
                    + Create
                </button>
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 w-[40%]">
                                Title
                            </th>
                            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Created By
                            </th>
                            <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Updated By
                            </th>
                            <th className="p-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tncs.map((tnc) => (
                            <tr
                                key={tnc.id}
                                className="group cursor-pointer border-b last:border-b-0 even:bg-gray-50 hover:bg-indigo-50/70 transition-colors"
                                onClick={(e) => {
                                    if (e.target.closest("button")) return;
                                    setSelectedTnc(tnc);
                                    setReadModalOpen(true);
                                }}
                            >
                                <td className="p-3">
                                    <span className="text-sm font-medium text-black  transition-colors">
                                        {tnc.title}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                                        {tnc.createdBy || "-"}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 group-hover:bg-white group-hover:shadow px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                                        {tnc.updatedBy || "-"}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 hover:bg-amber-500 text-white text-xs font-medium px-3 py-1.5 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                                        onClick={() => {
                                            setEditTnc(tnc);
                                            setModalOpen(true);
                                        }}
                                        aria-label={`Edit ${tnc.title}`}
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M3 14.5V17h2.5L15.3 7.2l-2.5-2.5L3 14.5z" />
                                            <path d="M12.8 4.7l2.5 2.5L17 5.5l-2.5-2.5-1.7 1.7z" />
                                        </svg>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tncs.length === 0 && !loading && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-6 text-center text-sm text-gray-500"
                                >
                                    No TNCs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
            {loading && <FullPageLoader />}
        </div>
    );
}
