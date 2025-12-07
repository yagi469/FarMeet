'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authHelper } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function AuthForm() {
    const [step, setStep] = useState<'EMAIL' | 'LOGIN' | 'SIGNUP'>('EMAIL');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const exists = await api.checkEmail(email);
            if (exists) {
                setStep('LOGIN');
            } else {
                setStep('SIGNUP');
            }
        } catch (err) {
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authHelper.login(email, password);
            login();
            const redirectUrl = searchParams.get('redirect') || '/';
            router.push(redirectUrl);
        } catch (err) {
            setError('パスワードが正しくありません。');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authHelper.signup(username, email, password, role);
            login();
            router.push('/');
        } catch (err) {
            setError('登録に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {step === 'SIGNUP' ? '登録を完了する' : 'ログインまたは登録'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {step === 'EMAIL' && (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="mb-6">
                            <h2 className="text-xl mb-4">FarMeetへようこそ</h2>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? '確認中...' : '続行'}
                        </button>
                    </form>
                )}

                {step === 'LOGIN' && (
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{email}</span>
                                <button type="button" onClick={() => setStep('EMAIL')} className="text-sm text-green-600 hover:underline">編集</button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                パスワード
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </form>
                )}

                {step === 'SIGNUP' && (
                    <form onSubmit={handleSignup}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{email}</span>
                                <button type="button" onClick={() => setStep('EMAIL')} className="text-sm text-green-600 hover:underline">編集</button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                ユーザー名
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                パスワード
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="role" className="block text-sm font-medium mb-2">
                                役割
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="USER">一般ユーザー（収穫体験者）</option>
                                <option value="FARMER">農家（農園運営者）</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? '登録中...' : '同意して登録'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm />
        </Suspense>
    );
}


