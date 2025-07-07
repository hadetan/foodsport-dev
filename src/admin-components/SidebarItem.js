import Link from "next/link";

export default function SidebarItem({ href, icon, label, isSelected }) {
    return (
        <li>
            <Link href={href} className={
                isSelected
                    ? "bg-primary text-primary-content rounded-lg"
                    : "text-base-content"
            }>
                {icon}
                {label}
            </Link>
        </li>
    );
}