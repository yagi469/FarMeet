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
                                className={`flex-1 py-2 text-center ${loginMethod === 'PHONE' ? 'border-b-2 border-gray-400 text-gray-400 font-bold' : 'text-gray-400'}`}
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
                            <div className="text-center py-8">
                                <div className="bg-gray-100 rounded-lg p-6">
                                    <div className="text-gray-400 mb-3">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">電話番号ログインは準備中です</p>
                                    <p className="text-gray-400 text-sm mt-2">メールアドレスでログインしてください</p>
                                </div>
                            </div>
                        )}

                        {/* Google Login Section */}
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-center text-gray-500 text-sm mb-4">または</p>
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080'}/oauth2/authorization/google`}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Googleでログイン
                            </a>
                        </div>
                    </>
                )}

                {
                    isPasswordLogin && (
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
                    )
                }

                {
                    step === 'OTP' && (
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
                    )
                }

                {
                    step === 'SIGNUP_DETAILS' && (
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
                    )
                }
            </div >
        </div >
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm />
        </Suspense>
    );
}


