'use client';

import * as React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

interface GuestSelectorProps {
    onGuestsChange: (adults: number, children: number) => void;
    adults: number;
    children: number;
}

export default function GuestSelector({ onGuestsChange, adults, children }: GuestSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [localAdults, setLocalAdults] = React.useState(adults);
    const [localChildren, setLocalChildren] = React.useState(children);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    React.useEffect(() => {
        setLocalAdults(adults);
        setLocalChildren(children);
    }, [adults, children]);

    const handleApply = () => {
        onGuestsChange(localAdults, localChildren);
        setOpen(false);
    };

    const totalGuests = adults + children;

    const GuestCounter = ({ label, subLabel, value, onChange, min = 0 }: {
        label: string;
        subLabel: string;
        value: number;
        onChange: (value: number) => void;
        min?: number;
    }) => (
        <div className="flex items-center justify-between py-4">
            <div>
                <div className="font-medium text-gray-900">{label}</div>
                <div className="text-sm text-gray-500">{subLabel}</div>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{value}</span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => onChange(value + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    const GuestContent = (
        <div className="space-y-2">
            <GuestCounter
                label="大人"
                subLabel="13歳以上"
                value={localAdults}
                onChange={setLocalAdults}
                min={0}
            />
            <div className="border-t border-gray-200" />
            <GuestCounter
                label="子供"
                subLabel="2〜12歳"
                value={localChildren}
                onChange={setLocalChildren}
                min={0}
            />
        </div>
    );

    const TriggerButton = (
        <Button
            variant={"outline"}
            className={cn(
                "w-full justify-start text-left font-normal border-none shadow-none px-0 hover:bg-transparent h-auto py-0",
                totalGuests === 0 && "text-muted-foreground"
            )}
            onClick={() => setOpen(true)}
        >
            <Users className="mr-2 h-4 w-4 text-gray-400" />
            {totalGuests > 0 ? (
                <span className="text-gray-600">
                    ゲスト{totalGuests}名
                    {adults > 0 && <span className="text-gray-400 text-xs ml-1">(大人{adults}</span>}
                    {children > 0 && <span className="text-gray-400 text-xs">{adults > 0 ? '、' : '('}子供{children}</span>}
                    {(adults > 0 || children > 0) && <span className="text-gray-400 text-xs">)</span>}
                </span>
            ) : (
                <span className="text-gray-400">ゲストを追加</span>
            )}
        </Button>
    );

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    {TriggerButton}
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="start">
                    {GuestContent}
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                            setLocalAdults(0);
                            setLocalChildren(0);
                        }}>
                            クリア
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                            適用
                        </Button>
                    </div>
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
                    <DrawerTitle>ゲストを選択</DrawerTitle>
                    <DrawerDescription>
                        参加人数を選択してください。
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    {GuestContent}
                </div>
                <DrawerFooter className="pt-2 flex-row gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => {
                        setLocalAdults(0);
                        setLocalChildren(0);
                    }}>
                        クリア
                    </Button>
                    <Button className="flex-1" onClick={handleApply}>
                        適用
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
