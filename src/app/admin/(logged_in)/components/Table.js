import React, { useState } from "react";
import UserRow from "@/app/admin/(logged_in)/components/userRow";
import ActivityRow from "./ActivityRow";
import ProductRow from "./ProductRow";

const Table = ({
    heading,
    tableData,
    tableType,
    onRowClick,
    className = "",
}) => {
    const rowsPerPage = 10;
    const currentPage = 1;
    const paginatedData = tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <div className="w-full overflow-x-auto rounded-lg">
            <table
                className={`table table-zebra w-full min-w-[600px] ${className}`}
            >
                <thead className="sticky top-0 bg-primary text-primary-content  ">
                    <tr>
                        {heading.map((columnName, idx) => (
                            <th
                                key={
                                    columnName
                                        ? `${columnName}-${idx}`
                                        : `heading-${idx}`
                                }
                            >
                                {columnName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableType == "userPage"
                        && paginatedData.map((user, idx) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                onRowClick={onRowClick}
                            />
                        ))}
                    {tableType == "activityPage"
                        && paginatedData.map((activity) => (
                            <ActivityRow
                                key={activity.id}
                                activity={activity}
                                onRowClick={onRowClick}
                            />
                        ))}
                    {tableType == "productPage"
                        && paginatedData.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                onRowClick={onRowClick}
                            />
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
