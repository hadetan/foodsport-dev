import React, { useEffect, useState } from "react";
import "../css/ActivitiesFIlter.css";
import { useSearchParams, usePathname } from "next/navigation";


export default function ActivitiesFilter({ activities, setFilteredActivities }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [filters, setFilters] = useState({
        name: searchParams.get("activity") || "",
        status: searchParams.get("status") || "",
        date: searchParams.get("date") || "",
        type: searchParams.get("type") || "",
    });

    const statusOptions = Array.from(new Set(activities.map(a => a.status))).filter(Boolean);
    const allActivityTypes = [
        "kayak",
        "hiking",
        "yoga",
        "fitness",
        "running",
        "cycling",
        "swimming",
        "dancing",
        "boxing",
        "other"
    ];
    const typeOptions = allActivityTypes;

    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.name) params.set("activity", filters.name);
        if (filters.status) params.set("status", filters.status);
        if (filters.type) params.set("type", filters.type);
        if (filters.date) params.set("date", filters.date);
        const paramString = params.toString();
        const newUrl = paramString ? `${pathname}?${paramString}` : pathname;
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', newUrl);
        }
    }, [filters, pathname]);

    useEffect(() => {
        setFilters({
            name: searchParams.get("activity") || "",
            status: searchParams.get("status") || "",
            date: searchParams.get("date") || "",
            type: searchParams.get("type") || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    function handleFilter() {
        let filtered = activities;
        if (filters.name) {
            filtered = filtered.filter(a => a.title.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.status) {
            filtered = filtered.filter(a => a.status === filters.status);
        }
        if (filters.type) {
            filtered = filtered.filter(a => a.activityType === filters.type);
        }
        if (filters.date) {
            filtered = filtered.filter(a => {
                return (a.date && a.date === filters.date) || (a.startDate && a.startDate === filters.date);
            });
        }
        // !filtered.length ? setFilteredActivities([null]) : setFilteredActivities(filtered);
        setFilteredActivities(filtered);
        console.log(filtered);
    }

    useEffect(() => {
        handleFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, activities]);

    return (
        <div className="filter-container">
            <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleChange}
                placeholder="Search by activity name"
                className="filter-input enhanced-input"
            />
            <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="filter-select enhanced-select"
            >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="filter-select enhanced-select"
            >
                <option value="">All Types</option>
                {typeOptions.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
            </select>
            <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleChange}
                className="filter-input"
            />
        </div>
    );
}
