"use client";

import { useAdminCategories } from "@/app/shared/contexts/adminCategoriesContext";
import FullPageLoader from "../components/FullPageLoader";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import { RotateCcw } from "lucide-react";

const { useAdminProducts } = require("@/app/shared/contexts/adminProductsContext");
const { useRouter } = require("next/navigation");
const { useState } = require("react");

const FilterBar = ({ setFilters, filters, categories }) => {
    console.log(categories);
    return (
        <div className="w-full mb-6">
            <div className="flex flex-col md:flex-row md:flex-wrap md:gap-4 lg:flex-nowrap lg:gap-4">
                <div className="flex flex-col md:flex-row md:w-full md:gap-4">
                    <div className="flex flex-col min-w-[180px]">
                        <label className="text-xs font-semibold mb-1">
                            Product Name
                        </label>
                        <input
                            type="text"
                            className="input input-bordered min-w-[180px]"
                            placeholder="Search by product name"
                            value={filters.productName || ""}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    productName: e.target.value,
                                }))
                            }
                        />
                    </div>
                    <div className="flex flex-col min-w-[160px]">
                        <label className="text-xs font-semibold mb-1">
                            Category
                        </label>
                        <select
                            className="input input-bordered min-w-[160px]"
                            value={filters.category}
                            onChange={(e) =>
                                setFilters((f) => ({
                                    ...f,
                                    category: e.target.value,
                                }))
                            }
                        >
                            <option value="">All</option>
                            {categories?.map((c) => {
                                return (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            className="btn btn-ghost p-2"
                            title="Reset filters"
                            onClick={() =>
                                setFilters({
                                    productName: "",
                                    category: "",
                                })
                            }
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductManagementPageContent() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [filters, setFilters] = useState({
        productName: "",
        category: "",
    });

    const { products, loading: tableLoading } = useAdminProducts();
    const { categories, loading: catLoading } = useAdminCategories();

    const sortedProducts = [...products].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    const filteredProducts = sortedProducts.filter((p) => {
        if (filters.productName && (!p.title || !p.title.toLowerCase().includes(filters.productName.toLowerCase()))) {
            return false;
        }
        if (filters.category && (!p.category?.name || !p.category.name.toLowerCase().includes(filters.category.toLowerCase()))) {
            return false;
        }
        return true;
    });

    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    console.log(paginatedProducts);

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const tableHeading = [
        "Product",
        "Category",
        "Price",
        "actions"
    ];

    const handleProductClick = (product) => {
        if (product && product.id) {
            router.push(`/admin/products/viewProduct/${product.id}`);
        }
    };

    const handlePageChange = (page) => setCurrentPage(page);

    const handleSetFilters = (updater) => {
        setFilters((prev) => {
            const next = updater(prev);
            return next;
        });
        setCurrentPage(1);
    };

    return (
        <>
            <h2 className="text-2xl font-bold">Products</h2>
            <div className="min-h-screen w-full overflow-y-auto p-4 lg:p-6">
                <div style={{ display: "flex", justifyContent: "end" }}>
                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            router.push("/admin/products/createProduct")
                        }
                    >
                        Create Activity
                    </button>
                </div>
                <div style={{ marginBottom: "30px" }}>
                    <div className="flex flex-col  md:flex-row md:items-end md:justify-between mb-6 gap-2">
                        <div className="flex-1">
                            <FilterBar setFilters={handleSetFilters} filters={filters} categories={categories} />
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto bg-base-100 rounded-lg shadow relative">
                    {tableLoading || catLoading ? (
                        <FullPageLoader />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table
                                heading={tableHeading}
                                tableData={paginatedProducts}
                                tableType={"productPage"}
                                onRowClick={handleProductClick}
                                className="cursor-pointer"
                            />
                        </div>
                    )}
                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    )
}