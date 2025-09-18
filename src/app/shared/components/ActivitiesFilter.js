import React, { useEffect, useState } from "react";
import "../css/ActivitiesFilter.css";
import { useSearchParams, usePathname } from "next/navigation";
import { ACTIVITY_TYPES_FORMATTED } from "@/app/constants/constants";
import { useTranslations } from 'next-intl';


export default function ActivitiesFilter({ activities, setFilteredActivities, handleReset, filters, setFilters }) {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();

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
                placeholder={t('Search.placeholder')}
                className="filter-input enhanced-input"
            />
            <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="filter-select enhanced-select"
            >
                <option value="">{t('Activity.ActivityTypes.allTypes')}</option>
                {ACTIVITY_TYPES_FORMATTED.map((formatted) => (
                    <option key={formatted} value={formatted}>{t(`Activity.ActivityTypes.${formatted}`) || formatted}</option>
                ))}
            </select>
            <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleChange}
                className="filter-input"
            />
            <div className="filter-actions">
                <button type="button" className="filter-btn reset" onClick={handleReset}>{t('Actions.reset') || 'Reset'}</button>
            </div>
        </div>
    );
}
