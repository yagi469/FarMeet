'use client';

interface DatePickerProps {
    onDateChange: (date: string) => void;
    selectedDate: string;
}

export default function DatePicker({ onDateChange, selectedDate }: DatePickerProps) {
    return (
        <div className="relative w-full">
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="appearance-none w-full bg-transparent border-none focus:outline-none cursor-pointer text-sm text-gray-600"
                placeholder="日程を追加"
            />
            {!selectedDate && (
                <div className="absolute inset-0 pointer-events-none flex items-center">
                    <span className="text-sm text-gray-400">日程を追加</span>
                </div>
            )}
        </div>
    );
}
