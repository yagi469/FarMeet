'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authHelper } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function AuthForm() {
    const [loginMethod, setLoginMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
    const [step, setStep] = useState<'INPUT' | 'OTP' | 'SIGNUP_DETAILS'>('INPUT');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // For password login flow check
    const [isPasswordLogin, setIsPasswordLogin] = useState(false);

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
                    setIsPasswordLogin(true);
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

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.sendPhoneOtp(phoneNumber);
            setStep('OTP');
        } catch (err) {
            setError('SMSの送信に失敗しました。電話番号を確認してください。');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login({ email, password });
            localStorage.setItem('token', response.token);
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
            if (loginMethod === 'EMAIL') {
                if (isSignup) {
                    const result = await api.verifyOtp(email, otp, true);
                    if ('valid' in result && result.valid) {
                        setStep('SIGNUP_DETAILS');
                    } else {
                        setError('認証コードが正しくありません。');
                    }
                } else {
                    // Login
                    const response = await api.verifyOtp(email, otp, false);
                    if ('token' in response && response.token) {
                        localStorage.setItem('token', response.token);
                        login();
                        const redirectUrl = searchParams.get('redirect') || '/';
                        router.push(redirectUrl);
                    } else {
                        setError('認証に失敗しました。');
                    }
                }
            } else {
                // Phone Login
                const response = await api.loginPhone(phoneNumber, otp);
                if (response.registered && response.token) {
                    // Registered User -> Login
                    localStorage.setItem('token', response.token);
                    login();
                    const redirectUrl = searchParams.get('redirect') || '/';
                    router.push(redirectUrl);
                } else if (!response.registered) {
                    // Unregistered User -> Signup
                    setIsSignup(true);
                    setStep('SIGNUP_DETAILS');
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
            await api.signup({
                username,
                email: email,
                password: 'otp-verified',
                role,
                phoneNumber: loginMethod === 'PHONE' ? phoneNumber : undefined,
                phoneOtp: loginMethod === 'PHONE' ? otp : undefined
            });
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
            if (loginMethod === 'EMAIL') {
                await api.sendOtp(email);
            } else {
                await api.sendPhoneOtp(phoneNumber);
            }
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

                {step === 'INPUT' && !isPasswordLogin && (
                    <>
                        <div className="flex mb-6 border-b">
                            <button
                                className={`flex-1 py-2 text-center ${loginMethod === 'EMAIL' ? 'border-b-2 border-green-600 text-green-600 font-bold' : 'text-gray-500'}`}
                                onClick={() => setLoginMethod('EMAIL')}
                            >
                                メール
                            </button>
                            <button
                                className={`flex-1 py-2 text-center ${loginMethod === 'PHONE' ? 'border-b-2 border-green-600 text-green-600 font-bold' : 'text-gray-500'}`}
                                onClick={() => setLoginMethod('PHONE')}
                            >
                                電話番号
                            </button>
                        </div>

                        {loginMethod === 'EMAIL' ? (
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
                        ) : (
                            <form onSubmit={handlePhoneSubmit}>
                                <div className="mb-6">
                                    <h2 className="text-xl mb-4">電話番号でログイン</h2>
                                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                        電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="09012345678"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        ※現在は既存ユーザーのログインのみ対応しています。
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                                >
                                    {loading ? 'コードを送信' : '続行'}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {isPasswordLogin && (
                    <form onSubmit={handlePasswordLogin}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">メールアドレス</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{email}</span>
                                <button type="button" onClick={() => setIsPasswordLogin(false)} className="text-sm text-green-600 hover:underline">編集</button>
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
                        <button type="button" onClick={() => setIsPasswordLogin(false)} className="block w-full text-center mt-4 text-sm text-gray-600 hover:text-gray-800">
                            戻る
                        </button>
                    </form>
                )}

                {step === 'OTP' && (
                    <form onSubmit={handleOtpVerify}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">{loginMethod === 'EMAIL' ? 'メールアドレス' : '電話番号'}</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{loginMethod === 'EMAIL' ? email : phoneNumber}</span>
                                <button type="button" onClick={() => setStep('INPUT')} className="text-sm text-green-600 hover:underline">編集</button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="otp" className="block text-sm font-medium mb-2">
                                認証コード
                            </label>
                            <div className="mb-2 text-sm text-gray-600">
                                {loginMethod === 'EMAIL' ? email : phoneNumber} に送信された6桁のコードを入力してください。
                            </div>
                            {loginMethod === 'EMAIL' && (
                                <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                                    ⚠️ メールが届かない場合は、迷惑メールフォルダをご確認ください。
                                </div>
                            )}
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
                            <p className="text-sm text-gray-500 mb-2">{loginMethod === 'EMAIL' ? 'メールアドレス（認証済み）' : '電話番号（認証済み）'}</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">{loginMethod === 'EMAIL' ? email : phoneNumber}</span>
                            </div>
                        </div>

                        {loginMethod === 'PHONE' && (
                            <div className="mb-4">
                                <label htmlFor="signup-email" className="block text-sm font-medium mb-2">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    id="signup-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                    placeholder="example@email.com"
                                />
                            </div>
                        )}

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


