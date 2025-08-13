"use client";
import { usePathname } from "next/navigation";
import SidebarItem from "@/app/admin/(logged_in)//components/SidebarItem";
import { Users, Calendar1, CircleGauge, Share2 } from "lucide-react";
import ThemeController from "@/app/admin/(logged_in)//components/ThemeController";
import { UsersProvider } from "@/app/shared/contexts/usersContenxt";

export default function AdminLoggedInLayout({ children }) {
    //add a check that only if the user is logged in as admin, they will be able to access it.
    const pathname = usePathname();

    return (
        <UsersProvider>
            <div className="drawer lg:drawer-open">
            <input
                id="admin-drawer"
                type="checkbox"
                className="drawer-toggle"
            />

            <div className="drawer-content flex flex-col">
                {/* Navbar */}
                <div className="navbar bg-base-100 lg:hidden shadow-sm px-4">
                    <div className="flex-none lg:hidden">
                        <label
                            htmlFor="admin-drawer"
                            className="btn btn-square btn-ghost drawer-button"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block w-5 h-5 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </label>
                    </div>
                </div>

                {/* Main Content */}
                <main className={`flex-1 px-4 lg:px-6 mt-9 overflow-y-auto`}>
                    {children}
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side bg-secondary rounded-2xl m-3">
                <aside className="w-full sm:w-64 relative">
                    {/* Close button for mobile, sticky at top */}
                    <div className="sm:hidden sticky top-0 z-10 flex justify-end bg-secondary p-2">
                        <label
                            htmlFor="admin-drawer"
                            className="btn btn-square btn-ghost"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block w-6 h-6 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </label>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <div className="text-xl font-bold px-4 py-2">
                            Welcome Admin
                        </div>
                        <ThemeController />
                    </div>
                    <div className="p-4">
                        <ul className="menu menu-lg gap-2 p-0 w-full sm:w-64">
                            <SidebarItem
                                href="/admin"
                                icon={<CircleGauge />}
                                label="Dashboard"
                                isSelected={pathname === "/admin"}
                            />
                            <SidebarItem
                                href="/admin/users"
                                icon={<Users />}
                                label="Users"
                                isSelected={pathname === "/admin/users"}
                            />
                            <SidebarItem
                                href="/admin/activities"
                                icon={<Calendar1 />}
                                label="Activities"
                                isSelected={pathname === "/admin/activities"}
                            />
                            <SidebarItem
                                href="/admin/social"
                                icon={<Share2 />}
                                label="Social Media"
                                isSelected={pathname === "/admin/social"}
                            />
                        </ul>
                    </div>
                </aside>
                {/* <div className="p-4">
                    Logout
                </div> */}
            </div>
        </div>
        </UsersProvider>
    );
}
