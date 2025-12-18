import { useState, useEffect } from 'react';
import { Shield, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { useIssuesStore } from '@/store/useIssuesStore';

import { parseRepositoryUrl, fetchUserRepos } from '@/lib/github';
import type { Repo } from '@/lib/github';

export function Onboarding() {
    const [token, setToken] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [error, setError] = useState('');

    const setUserToken = useIssuesStore((state) => state.setUserToken);
    const setRepo = useIssuesStore((state) => state.setRepo);
    const setDemoMode = useIssuesStore((state) => state.setDemoMode);

    // Auto-load repos if token is pasted and has correct format
    useEffect(() => {
        if (token.length > 10) {
            // Debounce or just check length? for now simple check
            // Actually, best to rely on blur or manual load to avoid spamming while typing
        }
    }, [token]);

    const loadRepos = async () => {
        if (!token) return;

        // Reset error if it was "repo error", but maybe keep if token error?
        setError('');
        setLoadingRepos(true);
        try {
            const fetchedRepos = await fetchUserRepos(token);
            setRepos(fetchedRepos);
            if (fetchedRepos.length === 0) {
                // Maybe show message but don't error?
            }
        } catch {
            console.error("Failed to load repos");
            // Don't block flow, maybe token is invalid but we'll catch that on submit or user notices
        } finally {
            setLoadingRepos(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token.trim()) {
            setError('Please enter a valid GitHub token');
            return;
        }

        try {
            const { owner, repo } = parseRepositoryUrl(repoUrl);
            setUserToken(token.trim());
            setRepo(owner, repo);
        } catch {
            setError('Invalid repository URL. Please use format: https://github.com/owner/repo');
        }
    };

    const handleDemoMode = () => {
        setDemoMode(true);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm">
            {/* Demo Banner - Top of page */}
            <button
                onClick={handleDemoMode}
                className="w-full py-2 px-6 text-center text-sm font-semibold transition-colors hover:bg-blue-700 bg-blue-600 text-white"
            >
                🎮 TRY DEMO MODE - See how it works!
            </button>

            {/* Modal Container */}
            <div className="flex items-center justify-center min-h-[calc(100vh-40px)] p-4">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="p-6 text-center bg-gray-800">
                        <h2 className="text-2xl font-bold text-white">
                            Welcome!
                        </h2>
                        <p className="mt-2 text-gray-400">
                            Let&apos;s get you started with GitHub Issues Swipe
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-gray-800">
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
                                        onBlur={() => { if (token) loadRepos(); }}
                                        className="block w-full rounded-lg border border-gray-600 bg-gray-900 p-3 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                        placeholder="ghp_..."
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400">Provide a token to load your repositories.</p>
                                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                            </div>

                            {/* Repository Input */}
                            <div>
                                <label htmlFor="repo" className="mb-2 block text-sm font-medium text-gray-300">
                                    Repository
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        {loadingRepos ? (
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
                                            </div>
                                        ) : null}

                                        {repos.length > 0 ? (
                                            <select
                                                id="repo"
                                                value={repoUrl}
                                                onChange={(e) => setRepoUrl(e.target.value)}
                                                className={`w-full appearance-none rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${loadingRepos ? 'pl-10' : ''}`}
                                                required
                                            >
                                                <option value="">Select a repository...</option>
                                                {repos.map((repo) => (
                                                    <option key={repo.id} value={repo.html_url}>
                                                        {repo.full_name}
                                                    </option>
                                                ))}
                                                {repoUrl && !repos.some(r => r.html_url === repoUrl) && (
                                                    <option value={repoUrl}>{repoUrl} (Manual)</option>
                                                )}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                id="repo"
                                                value={repoUrl}
                                                onChange={(e) => setRepoUrl(e.target.value)}
                                                className={`block w-full rounded-lg border border-gray-600 bg-gray-900 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${loadingRepos ? 'pl-10' : ''}`}
                                                placeholder="https://github.com/owner/repo"
                                                required
                                            />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={loadRepos}
                                        disabled={loadingRepos || !token}
                                        className="flex items-center justify-center rounded-lg border border-gray-600 bg-gray-900 px-4 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                                        title="Refresh Repositories"
                                    >
                                        <RefreshCw className={`h-5 w-5 ${loadingRepos ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                {repos.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setRepos([])}
                                        className="mt-1 text-xs text-gray-400 hover:text-gray-300 hover:underline"
                                    >
                                        Switch to manual URL input
                                    </button>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm">
                                <h3 className="font-semibold text-white">How to get a token:</h3>
                                <ol className="list-decimal space-y-2 pl-4 text-gray-400">
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
                                        Select <code className="rounded bg-gray-800 px-1 py-0.5 text-xs text-gray-300">repo</code> scope (for private repos) or public_repo.
                                    </li>
                                </ol>
                            </div>

                            {/* Privacy Note */}
                            <div className="flex items-start rounded-lg border border-gray-700 bg-gray-900 p-4">
                                <Shield className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                                <div className="text-sm text-gray-400">
                                    <p className="font-medium mb-1 text-white">Privacy First</p>
                                    <p>
                                        Everything is stored <strong>only in your browser&apos;s local storage</strong>.
                                        We do not transmit/store anything to our servers (no token, no issues, etc).
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            >
                                Start Swiping
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
