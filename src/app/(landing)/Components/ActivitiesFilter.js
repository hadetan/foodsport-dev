import React, { useEffect, useState } from "react";
import "../css/ActivitiesFIlter.css";

export default function ActivitiesFilter({ activities, setFilteredActivities, loading }) {
    const [filters, setFilters] = useState({
        name: "",
        status: "",
        date: "",
        type: "",
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
            filtered = filtered.filter(a => a.date === filters.date);
        }
        setFilteredActivities(filtered);
    }

        useEffect(() => {
            handleFilter();
        }, [filters, activities]);

    return (
        <div className="filter-container">
            <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleChange}
                placeholder="Search by activity name"
                className="filter-input"
            />
            <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="filter-select"
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
                className="filter-select"
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
