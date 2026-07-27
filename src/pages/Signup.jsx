import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Database, Lock, User, AlertCircle, Loader2, Eye, EyeOff, Users, CheckSquare, Square } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { teamService } from '../services/teamService';

export default function Signup() {
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get('invite');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [joinTeam, setJoinTeam] = useState(true);
    const [inviteInfo, setInviteInfo] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (inviteToken) {
            teamService.verifyInviteToken(inviteToken)
                .then(data => setInviteInfo(data))
                .catch(err => console.warn('Invite token error:', err.message));
        }
    }, [inviteToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await signup(username, password, inviteToken, joinTeam);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <Database className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-gray-500 italic">
                    Start managing your store today
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-6 shadow-xl shadow-gray-200/50 sm:rounded-3xl border border-gray-100/50 sm:px-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />

                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {/* Team Invitation Info Banner */}
                        {inviteInfo && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-600 text-white rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">Team Invitation</p>
                                        <p className="text-sm font-extrabold text-purple-950">
                                            You are invited to join <span className="underline decoration-purple-400">{inviteInfo.team_name}</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setJoinTeam(!joinTeam)}
                                    className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer pt-1"
                                >
                                    {joinTeam ? (
                                        <CheckSquare size={18} className="text-purple-700" />
                                    ) : (
                                        <Square size={18} className="text-purple-400" />
                                    )}
                                    Join this team upon registration
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="username" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    placeholder="choose a username"
                                    className="pl-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all w-full"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all w-full"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full h-12 text-sm font-bold tracking-wide rounded-xl shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to={inviteToken ? `/login?invite=${inviteToken}` : "/login"} className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Log in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
