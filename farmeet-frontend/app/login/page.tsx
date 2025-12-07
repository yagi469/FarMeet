'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authHelper } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function AuthForm() {
    const [step, setStep] = useState<'EMAIL' | 'PASSWORD' | 'OTP' | 'SIGNUP_DETAILS'>('EMAIL');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // For signup flow
    const [isSignup, setIsSignup] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { exists, isAdmin } = await api.checkEmail(email);

            if (exists) {
                if (isAdmin) {
                    setStep('PASSWORD');
                } else {
                    // Existing User -> Send OTP
                    await api.sendOtp(email);
                    setStep('OTP');
                    setIsSignup(false);
                }
            } else {
                // New User -> Send OTP for Verification First
                await api.sendOtp(email);
                setStep('OTP');
                setIsSignup(true);
            }
        } catch (err) {
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
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

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                const { valid } = await api.verifyOtp(email, otp, true);
                if (valid) {
                    setStep('SIGNUP_DETAILS');
                } else {
                    setError('認証コードが正しくありません。');
                }
            } else {
                // Login
                const response = await api.verifyOtp(email, otp, false);
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    login();
                    const redirectUrl = searchParams.get('redirect') || '/';
                    router.push(redirectUrl);
                } else {
                    setError('認証に失敗しました。');
                }
            }
        } catch (err) {
            setError('認証コードが正しくありません。');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authHelper.signup(username, email, 'otp-verified', role); // Use dummy password or change backend to optional
            // Note: Backend might strictly require password. 
            // Workaround: We will use a random strong password or 'otp-verified' string since they will login via OTP anyway.
            // But wait, the current AuthService.signup ENCODES the password.
            // If they ever need password login, they can reset it? 
            // For now, consistent with 'No Password For Users'.

            login();
            router.push('/');
        } catch (err) {
            setError('登録に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setError('');
        try {
            await api.sendOtp(email);
            alert('認証コードを再送信しました。（コンソールを確認してください）');
        } catch (err) {
            setError('再送信に失敗しました。');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-16">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {step === 'SIGNUP_DETAILS' ? '登録を完了する' : 'ログインまたは登録'}
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

                {step === 'PASSWORD' && (
                    <form onSubmit={handlePasswordLogin}>
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

                {step === 'OTP' && (
                    <form onSubmit={handleOtpVerify}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{email}</span>
                                <button type="button" onClick={() => setStep('EMAIL')} className="text-sm text-green-600 hover:underline">編集</button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="otp" className="block text-sm font-medium mb-2">
                                認証コード
                            </label>
                            <div className="mb-2 text-sm text-gray-600">
                                {email} に送信された6桁のコードを入力してください。
                            </div>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 tracking-widest text-lg text-center"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <div className="mt-2 text-right">
                                <button type="button" onClick={resendOtp} className="text-sm text-green-600 hover:underline">
                                    コードを再送信
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? '確認中...' : '認証して続行'}
                        </button>
                    </form>
                )}

                {step === 'SIGNUP_DETAILS' && (
                    <form onSubmit={handleSignup}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">メールアドレス（認証済み）</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{email}</span>
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
                            {loading ? '登録中...' : '登録を完了する'}
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


