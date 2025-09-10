import Link from "next/link";
import axios from "axios";

export default function SidebarItem({
    href,
    icon,
    label,
    isSelected,
    pathname,
    isLogoutButton,
}) {
    // Check if current path is a child of this sidebar item
    const isParentActive = (itemHref, currentPath) => {
        if (!itemHref || !currentPath) return false;

        // For admin activities - highlight when on any activity-related page
        if (itemHref === "/admin/activities") {
            return currentPath.startsWith("/admin/activities");
        }

        // For admin users - highlight when on any user-related page
        if (itemHref === "/admin/users") {
            return currentPath.startsWith("/admin/users");
        }

        // For other admin routes
        if (currentPath.startsWith(itemHref) && itemHref !== "/admin") {
            return true;
        }

        // Exact match for dashboard
        return currentPath === itemHref;
    };

    const isActive = isSelected || isParentActive(href, pathname);

    const handleLogout = async () => {
        try {
            await axios.delete("/api/admin/auth/logout");
            // Redirect to login page or home page after successful logout
            window.location.href = "/admin/login";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (isLogoutButton) {
        return (
            <li>
                <button
                    onClick={handleLogout}
                    className="text-base-content w-full text-left flex items-center"
                >
                    {icon}
                    {label}
                </button>
            </li>
        );
    }

    return (
        <li>
            <Link
                href={href}
                className={
                    isActive
                        ? "bg-primary text-primary-content rounded-lg"
                        : "text-base-content"
                }
            >
                {icon}
                {label}
            </Link>
        </li>
    );
}
