'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

interface DatePickerProps {
    onDateChange: (date: string) => void;
    selectedDate: string;
}

export default function DatePicker({ onDateChange, selectedDate }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        selectedDate ? new Date(selectedDate) : undefined
    );
    const [open, setOpen] = React.useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    React.useEffect(() => {
        if (selectedDate) {
            setDate(new Date(selectedDate));
        } else {
            setDate(undefined);
        }
    }, [selectedDate]);

    const handleSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            // ローカルタイムでのYYYY-MM-DD形式に変換
            const offset = newDate.getTimezoneOffset();
            const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
            onDateChange(localDate.toISOString().split('T')[0]);
        } else {
            onDateChange('');
        }
        if (isDesktop) {
            setOpen(false);
        }
    };

    const TriggerButton = (
        <Button
            variant={"outline"}
            className={cn(
                "w-full justify-start text-left font-normal border-none shadow-none px-0 hover:bg-transparent h-auto py-0",
                !date && "text-muted-foreground"
            )}
            onClick={() => setOpen(true)}
        >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
            {date ? (
                format(date, "yyyy年MM月dd日", { locale: ja })
            ) : (
                <span className="text-gray-400">日程を追加</span>
            )}
        </Button>
    );

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {TriggerButton}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        initialFocus
                        locale={ja}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {TriggerButton}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>日程を選択</DrawerTitle>
                    <DrawerDescription>
                        体験したい日付を選択してください。
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleSelect}
                        initialFocus
                        locale={ja}
                        className="w-full flex justify-center"
                    />
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">キャンセル</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
