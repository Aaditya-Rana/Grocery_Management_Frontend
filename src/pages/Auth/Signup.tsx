import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { api } from '../../api/client';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await api.auth.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            // Redirect to login after successful signup
            navigate('/login');
        } catch (err: any) {
            const errorMessage = Array.isArray(err.response?.data?.message)
                ? err.response?.data?.message[0]
                : err.response?.data?.message || 'Signup failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <AuthLayout
            title="Join Us"
            subtitle="Create your account to get started"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-3 animate-shake">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Full Name"
                        type="text"
                        icon={User}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={loading}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading}
                    />

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            icon={Lock}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={loading}
                        />
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                                    <span className={`text-xs font-semibold ${passwordStrength.strength === 1 ? 'text-red-600' :
                                        passwordStrength.strength === 2 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Input
                        label="Confirm Password"
                        type="password"
                        icon={Lock}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={loading}
                    />

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                        <div className={`flex items-center gap-2 text-sm ${formData.password === formData.confirmPassword
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {formData.password === formData.confirmPassword ? (
                                <>
                                    <CheckCircle size={16} />
                                    <span>Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} />
                                    <span>Passwords do not match</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-linear-to-r from-primary via-primary to-primary-dark hover:from-primary-dark hover:to-primary-dark text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                    aria-label="Create your account"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Creating Profile...</span>
                        </>
                    ) : (
                        <>
                            <span>Start Your Journey</span>
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                            Already have an account?
                        </span>
                    </div>
                </div>

                <Link
                    to="/login"
                    className="block text-center py-3 px-6 border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                >
                    Sign in
                </Link>
            </form>
        </AuthLayout>
    );
};
