import Link from "next/link";

export default function SidebarItem({
    href,
    icon,
    label,
    isSelected,
    pathname,
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
