"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/app/admin/(logged_in)/components/SearchBar";
import Dropdown from "@/app/admin/(logged_in)/components/Dropdown";
import Table from "@/app/admin/(logged_in)/components/Table";
import FullPageLoader from "../components/FullPageLoader";
import Pagination from "@/app/admin/(logged_in)/components/Pagination";
import api from "@/utils/axios/api";

const BadgeManagementContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredBadges, setFilteredBadges] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const pageSize = 10;

    // Get current page from URL, default to 1
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const totalPages = Math.ceil(filteredBadges.length / pageSize);

    // Fetch badges on mount
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/admin/badges");
                const fetchedBadges = response.data.badges || [];

                // Add demo badge if no badges exist
                if (fetchedBadges.length === 0) {
                    const demoBadges = [
                        {
                            id: "demo-badge-1",
                            name: "First Steps",
                            nameZh: "第一步",
                            description: "Complete your first activity",
                            descriptionZh: "完成你的第一個活動",
                            // imageUrl: "/logos/default-badge.png",
                            isActive: true,
                            activity: {
                                title: "Morning Yoga",
                                titleZh: "早晨瑜珈",
                                activityType: "yoga"
                            },
                            badgeRules: [
                                {
                                    id: "rule-1",
                                    type: "activity_participation_count",
                                    targetValue: 1,
                                    isActive: true
                                }
                            ]
                        }
                    ];
                    setBadges(demoBadges);
                } else {
                    setBadges(fetchedBadges);
                }
            } catch (error) {
                console.error("Error fetching badges:", error);
                // Add demo badge on error too
                const demoBadges = [
                    {
                        id: "demo-badge-1",
                        name: "First Steps",
                        nameZh: "第一步",
                        description: "Complete your first activity",
                        descriptionZh: "完成你的第一個活動",
                        // imageUrl: "/logos/default-badge.png",
                        isActive: true,
                        activity: {
                            title: "Morning Yoga",
                            titleZh: "早晨瑜珈",
                            activityType: "yoga"
                        },
                        badgeRules: [
                            {
                                id: "rule-1",
                                type: "activity_participation_count",
                                targetValue: 1,
                                isActive: true
                            }
                        ]
                    }
                ];
                setBadges(demoBadges);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, []);

    useEffect(() => {
        if (!Array.isArray(badges) || loading) {
            setFilteredBadges([]);
            return;
        }

        const q = String(searchQuery || "")
            .trim()
            .toLowerCase();

        const filtered = badges.filter((badge) => {
            const name = (badge.name || "").toLowerCase();
            const nameZh = (badge.nameZh || "").toLowerCase();
            const description = (badge.description || "").toLowerCase();
            const descriptionZh = (badge.descriptionZh || "").toLowerCase();
            const activityTitle = (badge.activity?.title || "").toLowerCase();
            const activityTitleZh = (badge.activity?.titleZh || "").toLowerCase();

            const matchesSearch =
                !q ||
                name.includes(q) ||
                nameZh.includes(q) ||
                description.includes(q) ||
                descriptionZh.includes(q) ||
                activityTitle.includes(q) ||
                activityTitleZh.includes(q);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && badge.isActive) ||
                (statusFilter === "inactive" && !badge.isActive);

            return matchesSearch && matchesStatus;
        });

        setFilteredBadges(filtered);

        // Reset to page 1 when filters change
        if (searchQuery || statusFilter !== "all") {
            const params = new URLSearchParams();
            params.set("page", "1");
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [searchQuery, badges, statusFilter, loading, router]);

    // Handle row click
    const handleRowClick = (badge) => {
        // For now, just log the badge click
        // You can add navigation to a badge detail page later
        console.log("Badge clicked:", badge);
    };

    const statusOptions = ["All", "Active", "Inactive"];
    const tableHeading = [
        "Badge Name",
        "Activity Name",
        "Activity Type",
        "Description",
        "Badge Rules",
        "Target Value",
        "Actions",
    ];

    const handleStatusChange = (status) => {
        setStatusFilter(status.toLowerCase());
    };

    // Only show badges for current page
    const paginatedBadges = filteredBadges.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handlePageChange = (page) => {
        // Update URL with new page number
        const params = new URLSearchParams();
        params.set("page", page.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <div className="text-2xl text-base-content">Manage Badges</div>
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/badges/create")}
                >
                    Create Badge
                </button>
            </div>
            {/* Search and Filters */}
            <div className="flex gap-4">
                <SearchBar
                    placeholderName="Search Badges"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                    <Dropdown
                        items={statusOptions}
                        name="Status"
                        selectedValue={
                            statusFilter === "all"
                                ? "All"
                                : statusFilter.charAt(0).toUpperCase() +
                                statusFilter.slice(1)
                        }
                        onSelect={handleStatusChange}
                    />
                </div>
            </div>

            {/* Badge Table */}
            <div className="overflow-x-auto rounded-lg shadow relative">
                {loading ? (
                    <FullPageLoader />
                ) : (
                    <div className="overflow-x-auto rounded-box border border-primary/60">
                        <Table
                            heading={tableHeading}
                            tableData={paginatedBadges}
                            tableType={"badgePage"}
                            onRowClick={handleRowClick}
                        />
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );
};

const BadgeManagementPage = () => (
    <Suspense fallback={<FullPageLoader />}>
        <BadgeManagementContent />
    </Suspense>
);

export default BadgeManagementPage;
