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
    ReceiptText,
} from "lucide-react";
import { UsersProvider } from "@/app/shared/contexts/usersContext";
import { DashboardProvider } from "@/app/shared/contexts/DashboardContext";
import { AdminActivitiesProvider } from "@/app/shared/contexts/AdminActivitiesContext";
import { SocialMediaImageProvider } from "@/app/shared/contexts/socialMediaImageContext";
import { useEffect } from "react";
import { VerifiedAttendeesProvider } from "@/app/shared/contexts/VerifiedAttendeesContext";
import "./adminLayout.css";

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
        <div data-theme="light" className="min-h-screen">
            <UsersProvider>
                <DashboardProvider>
                    <AdminActivitiesProvider>
                        <SocialMediaImageProvider>
                            <VerifiedAttendeesProvider>
                                <div className="flex">
                                    {/* Left sidebar for desktop */}
                                    <aside className="admin-sidebar hidden lg:block w-64 bg-base-200 rounded-2xl m-3 p-4">
                                        <div className="text-xl font-bold px-4 py-2">Welcome Admin</div>
                                        <div className="mt-4">
                                            <ul className="menu menu-lg gap-2 p-0 w-full">
                                                <SidebarItem href="/admin" icon={<CircleGauge />} label="Dashboard" pathname={pathname} />
                                                <SidebarItem href="/admin/users" icon={<Users />} label="All Users" pathname={pathname} />
                                                <SidebarItem href="/admin/activities" icon={<Calendar1 />} label="All Activities" pathname={pathname} />
                                                <SidebarItem href="/admin/social" icon={<Share2 />} label="Social Media Images" pathname={pathname} />
                                                <SidebarItem href="/admin/email" icon={<Mail />} label="Send Emails" pathname={pathname} />
                                                <SidebarItem href="/admin/register" icon={<UserPlus />} label="Create New Admin" pathname={pathname} />
                                                <SidebarItem href="/admin/terms&conditions" icon={<ReceiptText />} label="Terms & Conditions" isSelected={pathname === "/admin/terms&conditions"} pathname={pathname} />
                                                <SidebarItem href="/admin/logout" icon={<LogOut />} label="Logout" pathname={pathname} isLogoutButton={true} />
                                            </ul>
                                        </div>
                                    </aside>

                                    {/* Main content area */}
                                    <div className="flex-1 w-full">
                                        {/* Top navbar for tablet and smaller (visible below lg) */}
                                        <header className="admin-topnav lg:hidden bg-base-100 shadow-sm">
                                            <nav className="navbar max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto">
                                                <ul className="topnav-menu flex items-center gap-2 p-0 m-0 whitespace-nowrap">
                                                    <SidebarItem href="/admin" icon={<CircleGauge />} label="Dashboard" pathname={pathname} />
                                                    <SidebarItem href="/admin/users" icon={<Users />} label="All Users" pathname={pathname} />
                                                    <SidebarItem href="/admin/activities" icon={<Calendar1 />} label="All Activities" pathname={pathname} />
                                                    <SidebarItem href="/admin/social" icon={<Share2 />} label="Social Media Images" pathname={pathname} />
                                                    <SidebarItem href="/admin/email" icon={<Mail />} label="Send Emails" pathname={pathname} />
                                                    <SidebarItem href="/admin/register" icon={<UserPlus />} label="Create New Admin" pathname={pathname} />
                                                    <SidebarItem href="/admin/terms&conditions" icon={<ReceiptText />} label="Terms & Conditions" isSelected={pathname === "/admin/terms&conditions"} pathname={pathname} />
                                                    <SidebarItem href="/admin/logout" icon={<LogOut />} label="Logout" pathname={pathname} isLogoutButton={true} />
                                                </ul>
                                            </nav>
                                        </header>

                                        <main className={`mt-6 px-4`}>{children}</main>
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
