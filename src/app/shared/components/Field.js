export default function Field({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-base font-medium text-base-content mb-1 pl-1 capitalize">
                {label}
            </label>
            <input
                type="text"
                className="input input-bordered w-full bg-base-100 text-base-content"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label}`}
            />
        </div>
    );
}
