import Link from 'next/link';
import { Farm } from '@/types';

interface FarmCardProps {
    farm: Farm;
}

export default function FarmCard({ farm }: FarmCardProps) {
    return (
        <Link href={`/farms/${farm.id}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer">
                {farm.imageUrl ? (
                    <img
                        src={farm.imageUrl}
                        alt={farm.name}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-lg">🌾 {farm.name}</span>
                    </div>
                )}
                <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{farm.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{farm.description}</p>
                    <p className="text-sm text-gray-500">📍 {farm.location}</p>
                </div>
            </div>
        </Link>
    );
}
