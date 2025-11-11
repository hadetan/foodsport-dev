import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-4">
        <div className="btn-group">
            <button
                className="btn btn-outline"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={18} />
            </button>
            <button className="btn btn-outline cursor-default" >
                Page {currentPage} of {totalPages || 1}
            </button>
            <button
                className="btn btn-outline"
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    </div>
);

export default Pagination;
