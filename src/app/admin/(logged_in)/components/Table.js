import React, { useState } from "react";
import UserRow from "@/app/admin/(logged_in)/components/userRow";
import ActivityRow from "./ActivityRow";

const Table = ({
    heading,
    tableData,
    tableType,
    onRowClick,
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
            <table className="table table-zebra w-full">
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
                                  key={
                                      user.id 
                                
                                  }
                                  user={user}
                                  onRowClick={onRowClick}
                              />
                          ))
                        : paginatedData.map((activity) => (
                              <ActivityRow
                                  key={activity.id}
                                  activity={activity}
                              />
                          ))}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4 gap-2">
                <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                <span className="mx-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="btn btn-sm"
                    onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default Table;
