import React, { useState } from "react";
import UserRow from "@/app/admin/(logged_in)/components/userRow";
import ActivityRow from "./ActivityRow";

const Table = ({
    heading,
    tableData,
    tableType,
    onRowClick,
    className = "",
}) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(tableData.length / rowsPerPage);

    // Calculate paginated data
    const paginatedData = tableData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    return (
        <>
            <table className={`table table-zebra w-full ${className}`}>
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
                        ? paginatedData.map((user, idx) => (
                              <UserRow
                                  key={user.id}
                                  user={user}
                                  onRowClick={onRowClick}
                              />
                          ))
                        : paginatedData.map((activity) => (
                              <ActivityRow
                                  key={activity.id}
                                  activity={activity}
                                  onRowClick={onRowClick}
                              />
                          ))}
                </tbody>
            </table>
          
        </>
    );
};

export default Table;
