import Link from "next/link";

export default function SidebarItem({ href, icon, label, isSelected }) {
    return (
        <li>
            <Link href={href} className={
                isSelected
                    ? "active bg-[#8A8C91] text-white rounded-lg"
                    : "text-[#8A8C91]"
            }>
                {icon}
                {label}
            </Link>
        </li>
    );
}