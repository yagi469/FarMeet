'use client';

import { useState } from 'react';

interface DatePickerProps {
    onDateChange: (date: string) => void;
    selectedDate: string;
}

export default function DatePicker({ onDateChange, selectedDate }: DatePickerProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full h-6">
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`absolute inset-0 w-full h-full bg-transparent border-none focus:outline-none cursor-pointer text-sm z-10 ${!selectedDate ? 'text-transparent' : 'text-gray-600'
                    }`}
            />
            {!selectedDate && (
                <div className="absolute inset-0 pointer-events-none flex items-center z-0">
                    <span className="text-sm text-gray-400">日程を追加</span>
                </div>
            )}
        </div>
    );
}
