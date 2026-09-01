import React, {useState} from 'react';
import {User, Mail, Lock, Loader2, ArrowRight} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {FieldError} from '../common/FieldError';

interface LoginFormProps {
    onSuccess: (msg: string) => void;
    onError: (err: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    onClose: () => void;
    onResetAlerts: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
                                                        onSuccess,
                                                        onError,
                                                        isLoading,
                                                        setIsLoading,
                                                        onClose,
                                                        onResetAlerts,
                                                    }) => {
    const {login} = useAuth();
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const clearFieldError = (key: string) => {
        if (fieldErrors[key]) {
            setFieldErrors((prev) => {
                const next = {...prev};
                delete next[key];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onResetAlerts();
        setFieldErrors({});
        setIsLoading(true);

        try {
            await login({username, email, password});
            onSuccess('Logged in successfully!');
            setTimeout(onClose, 800);
        } catch (err: any) {
            if (err.fieldErrors && typeof err.fieldErrors === 'object') {
                setFieldErrors(err.fieldErrors);
                if (err.fieldErrors.non_field_errors) {
                    onError(err.fieldErrors.non_field_errors.join(' '));
                } else {
                    onError(err.message || 'Login failed. Please check your credentials.');
                }
            } else {
                onError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!email && (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Username
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none"/>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                clearFieldError('username');
                            }}
                            placeholder="e.g. alex_dev"
                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                                fieldErrors.username ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
                            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
                        />
                    </div>
                    <FieldError error={fieldErrors.username}/>
                </div>
            )}

            {!username && (
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none"/>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearFieldError('email');
                            }}
                            placeholder="alex@example.com"
                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                                fieldErrors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
                            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
                        />
                    </div>
                    <FieldError error={fieldErrors.email}/>
                </div>
            )}

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Password
                </label>
                <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none"/>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError('password');
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                            fieldErrors.password ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
                        } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
                    />
                </div>
                <FieldError error={fieldErrors.password}/>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin"/>
                ) : (
                    <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4"/>
                    </>
                )}
            </button>
        </form>
    );
};
