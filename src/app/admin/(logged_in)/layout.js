"use client";
import { usePathname } from "next/navigation";
import SidebarItem from "@/app/admin/(logged_in)//components/SidebarItem";
import {
    Users,
    Calendar1,
    CircleGauge,
    Share2,
    Mail,
    UserPlus,
    LogOut,
    ReceiptText
} from "lucide-react";
import { UsersProvider } from "@/app/shared/contexts/usersContext";
import { DashboardProvider } from "@/app/shared/contexts/DashboardContext";
import { AdminActivitiesProvider } from "@/app/shared/contexts/AdminActivitiesContext";
import { SocialMediaImageProvider } from "@/app/shared/contexts/socialMediaImageContext";
import { useEffect } from "react";
import { VerifiedAttendeesProvider } from "@/app/shared/contexts/VerifiedAttendeesContext";

export default function AdminLoggedInLayout({ children }) {
    const pathname = usePathname();
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("admin_auth_token");
            if (!token) {
                window.location.href = "/admin/login";
            }
        }
    }, []);

    return (
        <div data-theme="light">
            <UsersProvider>
                <DashboardProvider>
                    <AdminActivitiesProvider>
                        <SocialMediaImageProvider>
                            <VerifiedAttendeesProvider>
                            <div className="drawer lg:drawer-open">
                                <input
                                    id="admin-drawer"
                                    type="checkbox"
                                    className="drawer-toggle"
                                />

                                <div className="drawer-content flex flex-col">
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

                                    <main
                                        className={`flex-1 mt-4 pr-4 overflow-y-auto`}
                                    >
                                        {children}
                                    </main>
                                </div>

                                <div className="drawer-side bg-base-200 rounded-2xl m-3">
                                    <aside className="w-full sm:w-64 relative">
                                        <div className="sm:hidden sticky top-0 z-10 flex justify-end bg-base-200 p-2">
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
                                        </div>
                                        <div className="p-4">
                                            <ul className="menu menu-lg gap-2 p-0 w-full sm:w-64">
                                                <SidebarItem
                                                    href="/admin"
                                                    icon={<CircleGauge />}
                                                    label="Dashboard"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/users"
                                                    icon={<Users />}
                                                    label="All Users"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/activities"
                                                    icon={<Calendar1 />}
                                                    label="All Activities"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/social"
                                                    icon={<Share2 />}
                                                    label="Social Media Images"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/email"
                                                    icon={<Mail />}
                                                    label="Send Emails"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/register"
                                                    icon={<UserPlus />}
                                                    label="Create New Admin"
                                                    pathname={pathname}
                                                />
                                                <SidebarItem
                                                    href="/admin/terms&conditions"
                                                    icon={<ReceiptText />}
                                                    label="Terms & Conditions"
                                                    isSelected={
                                                        pathname ===
                                                        "/admin/terms&conditions"
                                                    }
                                                />
                                                <SidebarItem
                                                    href="/admin/logout"
                                                    icon={<LogOut />}
                                                    label="Logout"
                                                    pathname={pathname}
                                                    isLogoutButton={true}
                                                />
                                            </ul>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                            </VerifiedAttendeesProvider>
                        </SocialMediaImageProvider>
                    </AdminActivitiesProvider>
                </DashboardProvider>
            </UsersProvider>
        </div>
    );
}
