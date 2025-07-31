import React from "react";
import UserRow from "@/app/admin/(logged_in)/users/userRow";
import ActivityRow from "./ActivityRow";

const Table = ({
    heading,
    tableData,
    tableType,
    shouldShowEdit,
    setActivity,
}) => {
    return (
        <>
            <table className="table table-zebra w-full">
                <thead className="sticky top-0 bg-primary text-primary-content  ">
                    <tr>
                        {heading.map((columnName) => (
                            <th key={columnName}>{columnName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableType == "userPage"
                        ? tableData.map((user) => (
                              <UserRow
                                  key={user.id || user._id || user.email}
                                  user={user}
                              />
                          ))
                        : tableData.map((activity) => (
                              <ActivityRow
                                  key={activity.id}
                                  activity={activity}
                                  shouldShowEdit={shouldShowEdit}
                                  setActivity={setActivity}
                              />
                          ))}
                </tbody>
            </table>
        </>
    );
};

export default Table;
