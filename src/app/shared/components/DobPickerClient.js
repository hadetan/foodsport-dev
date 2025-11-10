'use client';
import { useEffect, useRef, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

function toDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

function formatISO(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${d}-${m}-${y}`;
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function DobPickerClient({ value = '', onChange = () => { }, id = 'dob', required = false, label = 'Date of birth' }) {
    const parsed = toDate(value);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(parsed);
    const [viewDate, setViewDate] = useState(parsed || new Date());
    const ref = useRef();

    useEffect(() => {
        setSelected(parsed);
        if (parsed) setViewDate(parsed);
    }, [value]);

    useEffect(() => {
        function onClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const today = new Date();

    function handleSelect(day) {
        if (!day) return;
        // prevent future selection
        if (day > today) return;
        setSelected(day);
        onChange(formatISO(day));
        setOpen(false);
    }

    function changeMonth(offset) {
        setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + offset, 1));
    }

    const firstDay = startOfMonth(viewDate);
    const startWeekday = firstDay.getDay();
    const totalDays = daysInMonth(viewDate);

    // years for quick selection (older users): from currentYear down to currentYear-100
    const currentYear = today.getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 100; y--) years.push(y);

    return (
        <div className="relative" ref={ref}>
            <label className="block mb-1 font-medium text-black">
                {label}
            </label>
            <input
                id={id}
                type="text"
                className="input input-bordered w-full cursor-pointer"
                value={selected ? formatISO(selected) : ''}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                readOnly
                aria-label="Date of birth"
                required={required}
            />

            {open && (
                <div className="absolute z-50 mt-2 bg-white border rounded-lg shadow-lg p-3 w-[320px] sm:w-[360px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm" aria-label="Previous month">
                                <HiChevronLeft className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <div className="font-medium">{viewDate.toLocaleString(undefined, { month: 'long' })}</div>
                            <button type="button" onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm" aria-label="Next month">
                                <HiChevronRight className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                aria-label="Month"
                                className="select select-bordered select-sm"
                                value={viewDate.getMonth()}
                                onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), Number(e.target.value), 1))}
                            >
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <option key={i} value={i}>{new Date(0, i).toLocaleString(undefined, { month: 'short' })}</option>
                                ))}
                            </select>
                            <select
                                aria-label="Year"
                                className="select select-bordered select-sm"
                                value={viewDate.getFullYear()}
                                onChange={(e) => setViewDate(new Date(Number(e.target.value), viewDate.getMonth(), 1))}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="text-xs font-semibold">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startWeekday }).map((_, i) => (
                            <div key={`pad-${i}`} className="h-10"></div>
                        ))}

                        {Array.from({ length: totalDays }).map((_, idx) => {
                            const dayNum = idx + 1;
                            const dt = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
                            const isPast = dt <= today;
                            const isSelected = selected && selected.getFullYear() === dt.getFullYear() && selected.getMonth() === dt.getMonth() && selected.getDate() === dt.getDate();
                            return (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => handleSelect(dt)}
                                    disabled={!isPast}
                                    className={`h-10 w-10 flex items-center justify-center rounded ${isSelected ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} ${!isPast ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    aria-pressed={isSelected}
                                >
                                    <span className="text-sm">{dayNum}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
