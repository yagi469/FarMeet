'use client';

import Link from 'next/link';
import { Farm } from '@/types';
import { useState } from 'react';

interface FarmCardProps {
    farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <Link href={`/farms/${farm.id}`}>
            <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-3">
                    {farm.imageUrl ? (
                        <img
                            src={farm.imageUrl}
                            alt={farm.name}
                            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full aspect-square bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-green-600 text-4xl">🌾</span>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsFavorite(!isFavorite);
                        }}
                        className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                    >
                        <svg
                            className={`w-6 h-6 ${isFavorite
                                    ? 'fill-red-500 stroke-red-500'
                                    : 'fill-none stroke-white'
                                } drop-shadow-md`}
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{farm.name}</h3>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium">4.9</span>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm truncate">{farm.location}</p>
                    <p className="text-gray-700 text-sm line-clamp-2">{farm.description}</p>
                    <p className="font-medium text-gray-900">
                        <span className="font-semibold">¥3,500</span> / 1人
                    </p>
                </div>
            </div>
        </Link>
    );
}
