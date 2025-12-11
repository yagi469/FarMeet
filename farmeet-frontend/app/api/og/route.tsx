import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'FarMeet';
    const description = searchParams.get('description') || '農業体験予約プラットフォーム';
    const imageUrl = searchParams.get('image');
    const location = searchParams.get('location') || '';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#f0fdf4',
                    position: 'relative',
                }}
            >
                {/* Background image or gradient */}
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.3,
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            opacity: 0.1,
                        }}
                    />
                )}

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '60px',
                        height: '100%',
                        position: 'relative',
                    }}
                >
                    {/* Logo */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '32px',
                            }}
                        >
                            🌾
                        </div>
                        <span
                            style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: '#16a34a',
                            }}
                        >
                            FarMeet
                        </span>
                    </div>

                    {/* Main content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: '56px',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                lineHeight: 1.2,
                                margin: 0,
                                maxWidth: '900px',
                            }}
                        >
                            {title}
                        </h1>

                        {location && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#4b5563',
                                    fontSize: '24px',
                                }}
                            >
                                <span>📍</span>
                                <span>{location}</span>
                            </div>
                        )}

                        <p
                            style={{
                                fontSize: '28px',
                                color: '#6b7280',
                                margin: 0,
                                maxWidth: '800px',
                                lineHeight: 1.4,
                            }}
                        >
                            {description.length > 100 ? description.slice(0, 100) + '...' : description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '20px',
                                color: '#9ca3af',
                            }}
                        >
                            農業体験予約プラットフォーム
                        </span>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#16a34a',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '9999px',
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}
                        >
                            今すぐ予約
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
