import { Eye, Pencil } from "lucide-react";

const { useRouter } = require("next/navigation")

const ProductRow = ({ product, onRowClick }) => {
    const router = useRouter();

    const handleEdit = (e) => {
        e.stopPropagation();
        router.push(`/admin/products/${product.id}`);
    };

    const handleViewDetails = (e) => {
        e.stopPropagation();
        router.push(`/admin/products/viewProduct/${product.id}`);
    }

    const handleRowClick = () => {
        if (onRowClick) {
            onRowClick(product);
        } else {
            router.push(`/admin/products/viewProduct/${product.id}`);
        }
    };

    return (
        <>
            <tr
                key={product.id}
                className="text-base align-middle cursor-pointer hover:bg-purple-100"
                onClick={handleRowClick}
            >
                <td className="align-middle">
                    <div className="flex items-center space-x-3">
                        <div className="avatar">
                            <div className="mask mask-squircle w-16 h-16">
                                <img
                                    src={product.productImageUrl}
                                    alt={product.title}
                                    className="cursor-pointer hover:opacity-75"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = null;
                                    }}
                                />
                            </div>
                        </div>
                        <div className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                            <div className="font-bold text-base max-w-[220px] md:max-w-[320px] break-words">
                                {product.title}
                            </div>
                        </div>
                    </div>
                </td>
                {/* product category name */}
                <td className="text-base align-middle">
                    {product.category.name}
                </td>
                <td className="text-base align-middle">
                    {product.price} Points
                </td>
                <td>
                    <div className="flex flex-row items-center justify-start gap-2">
                        <button
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={handleViewDetails}
                            title="View Activity Details"
                        >
                            <Eye size={25} className="text-black-400" />
                        </button>
                        <button
                            className="btn btn-sm btn-ghost btn-square"
                            onClick={handleEdit}
                            title="Edit Activity"
                        >
                            <Pencil size={25} className="text-black-400" />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    )
}

export default ProductRow;