import Link from "next/link";
import axios from '@/utils/axios/api';
import { useRouter } from "next/navigation";

export default function SidebarItem({
    href,
    icon,
    label,
    isSelected,
    pathname,
    isLogoutButton,
    onClick,
}) {
    const router = useRouter();

    const isParentActive = (itemHref, currentPath) => {
        if (!itemHref || !currentPath) return false;

        if (itemHref === "/admin/activities") {
            return currentPath.startsWith("/admin/activities");
        }

        if (itemHref === "/admin/users") {
            return currentPath.startsWith("/admin/users");
        }

        if (currentPath.startsWith(itemHref) && itemHref !== "/admin") {
            return true;
        }

        return currentPath === itemHref;
    };

    const isActive = isSelected || isParentActive(href, pathname);

    const handleLogout = async (e) => {
        if (onClick) onClick(e);
        try {
            await axios.delete("/admin/auth/logout");
            localStorage.removeItem('admin_auth_token')
            router.push("/admin/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (isLogoutButton) {
        return (
            <li>
                <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-full text-left flex items-center px-4 py-2 rounded-lg transition-colors text-red-500
     ${
         isActive
             ? "bg-primary text-primary-content"
             : "text-base-content hover:bg-base-200"
     }
 `}
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
                        ? "bg-primary text-primary-content rounded-lg flex content whitespace-nowrap"
                        : "text-base-content flex content whitespace-nowrap"
                }
                onClick={onClick}
            >
                {icon}
                {label}
            </Link>
        </li>
    );
}
