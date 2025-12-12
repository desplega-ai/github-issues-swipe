import { useState } from 'react';
import { Shield, Key, ExternalLink } from 'lucide-react';
import { useIssuesStore } from '@/store/useIssuesStore';

export function Onboarding() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const setUserToken = useIssuesStore((state) => state.setUserToken);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('Please enter a valid GitHub token');
            return;
        }
        if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
            // Just a soft warning/check, typically PATs start with these but not always strict.
            // Let's not block it, just in case. Or maybe we should? 
            // Nah, let the API validation handle it.
        }

        setUserToken(token.trim());
        // Trigger a reload or state change? 
        // The parent component should react to the store change.
        // Ideally we might want to validate the token here before saving, but the plan said "Save -> App Loads -> Verify".
        // Let's just save for now. Validation will happen when fetching issues.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">Welcome!</h2>
                    <p className="mt-2 text-blue-100">Let&apos;s get you started with GitHub Issues Swipe</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Input Group */}
                        <div>
                            <label htmlFor="token" className="mb-2 block text-sm font-medium text-gray-300">
                                GitHub Personal Access Token
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Key className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    id="token"
                                    value={token}
                                    onChange={(e) => {
                                        setToken(e.target.value);
                                        setError('');
                                    }}
                                    className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="ghp_..."
                                    required
                                />
                            </div>
                            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                        </div>

                        {/* Instructions */}
                        <div className="space-y-3 rounded-lg bg-gray-800/50 p-4 text-sm text-gray-400">
                            <h3 className="font-semibold text-gray-300">How to get a token:</h3>
                            <ol className="list-decimal space-y-2 pl-4">
                                <li>
                                    Go to{' '}
                                    <a
                                        href="https://github.com/settings/tokens"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline"
                                    >
                                        GitHub Settings <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </li>
                                <li>Generate a new token (Classic or Fine-grained)</li>
                                <li>
                                    Select <code className="rounded bg-gray-800 px-1 py-0.5 text-xs text-blue-300">repo</code> scope (for private repos) or public_repo.
                                </li>
                            </ol>
                        </div>

                        {/* Privacy Note */}
                        <div className="flex items-start rounded-lg border border-blue-900/50 bg-blue-900/20 p-4">
                            <Shield className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-blue-400" />
                            <div className="text-sm text-blue-200">
                                <p className="font-medium text-blue-100 mb-1">Privacy First</p>
                                <p>
                                    Your token is stored <strong>only in your browser&apos;s local storage</strong>.
                                    We do not transmit it to our servers.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Start Swiping
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
