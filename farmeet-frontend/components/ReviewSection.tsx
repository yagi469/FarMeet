'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { authHelper } from '@/lib/auth';
import { Review } from '@/types';
import StarRating from './StarRating';

interface ReviewSectionProps {
    farmId: number;
}

export default function ReviewSection({ farmId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Review form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [farmId]);

    const loadReviews = async () => {
        try {
            const data = await api.getReviews(farmId);
            setReviews(data.reviews);
            setAverageRating(data.averageRating);
            setReviewCount(data.reviewCount);
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!authHelper.isAuthenticated()) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        setSubmitting(true);
        try {
            await api.createReview(farmId, rating, comment);
            setComment('');
            setRating(5);
            setShowForm(false);
            await loadReviews();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('レビューの投稿に失敗しました。この農園での体験を完了してからレビューを投稿できます。');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'Z');
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 border-t">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">レビュー</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={Math.round(averageRating)} size="md" />
                        <span className="font-semibold">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({reviewCount}件のレビュー)</span>
                    </div>
                </div>
                {authHelper.isAuthenticated() && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        レビューを書く
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4">レビューを投稿</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            評価
                        </label>
                        <StarRating
                            rating={rating}
                            size="lg"
                            interactive={true}
                            onChange={setRating}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            コメント（任意）
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="この農園での体験について教えてください..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? '投稿中...' : '投稿する'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-2">✨</div>
                    <p className="text-gray-500">まだレビューがありません</p>
                    {authHelper.isAuthenticated() && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-3 text-green-600 font-medium hover:underline"
                        >
                            最初のレビューを書く
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    {review.user.avatarUrl ? (
                                        <img
                                            src={review.user.avatarUrl}
                                            alt={review.user.username}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg">👤</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{review.user.username}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500 text-sm">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                    <StarRating rating={review.rating} size="sm" />
                                    {review.comment && (
                                        <p className="mt-2 text-gray-700">{review.comment}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
