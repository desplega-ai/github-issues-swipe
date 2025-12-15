import { useState, useEffect, useCallback } from 'react';
import { useIssuesStore } from '@/store/useIssuesStore';
import { fetchRepoLabels, fetchUserRepos, parseRepositoryUrl } from '@/lib/github';
import { X, Save, RefreshCw } from 'lucide-react';
import type { Label, Repo } from '@/lib/github';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const store = useIssuesStore();

    const [token, setToken] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [labels, setLabels] = useState<Label[]>([]);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [settings, setSettings] = useState(store.settings);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [error, setError] = useState('');

    // Sync with store when opening
    useEffect(() => {
        if (isOpen) {
            setToken(store.userToken || '');
            setRepoUrl(store.repoOwner && store.repoName
                ? `https://github.com/${store.repoOwner}/${store.repoName}`
                : ''
            );
            setSettings(store.settings);
        }
    }, [isOpen, store.userToken, store.repoOwner, store.repoName, store.settings]);

    const loadRepos = useCallback(async () => {
        if (!token) return;
        setLoadingRepos(true);
        try {
            const fetchedRepos = await fetchUserRepos(token);
            setRepos(fetchedRepos);
        } catch {
            console.error("Failed to load repos");
        } finally {
            setLoadingRepos(false);
        }
    }, [token]);

    const loadLabels = useCallback(async () => {
        if (!token) return;

        let owner, repo;
        try {
            const parsed = parseRepositoryUrl(repoUrl);
            owner = parsed.owner;
            repo = parsed.repo;
        } catch {
            return; // Don't try loading if invalid repo url
        }

        try {
            const fetchedLabels = await fetchRepoLabels(token, owner, repo);
            setLabels(fetchedLabels);
        } catch {
            console.error("Failed to load labels");
        }
    }, [token, repoUrl]);

    // Initial load of labels if we have credentials
    // Also load repos if token is present
    useEffect(() => {
        if (isOpen && token) {
            if (repoUrl) loadLabels();
            if (repos.length === 0) loadRepos();
        }
    }, [isOpen, token, repoUrl, repos.length, loadLabels, loadRepos]);

    // Reload labels when repoUrl changes
    useEffect(() => {
        if (isOpen && token && repoUrl) {
            loadLabels();
        }
    }, [isOpen, token, repoUrl, loadLabels]);


    const handleSave = () => {
        setError('');

        if (!token.trim()) {
            setError('Token is required');
            return;
        }

        let owner, repo;
        try {
            const parsed = parseRepositoryUrl(repoUrl);
            owner = parsed.owner;
            repo = parsed.repo;
        } catch {
            setError('Invalid Repository URL');
            return;
        }

        // Only update store if things changed to avoid unnecessary resets
        if (token !== store.userToken) {
            store.setUserToken(token);
        }

        if (owner !== store.repoOwner || repo !== store.repoName) {
            store.setRepo(owner, repo);
            // Force reset issues if repo changes but token didn't (which handles its own reset)
            if (token === store.userToken) {
                store.reset(); // Or just clear issues? reset clears everything including history.
                // Actually if repo changes, history is invalid for that repo? 
                // Ideally we'd separate history by repo, but for now simple reset is safer.
            }
        }

        store.updateSettings(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-8">

                        {/* Connection Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Connection</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">GitHub Token</label>
                                    <input
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        onBlur={() => { if (token) loadRepos(); }}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="ghp_..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Provide a token to load your repositories.</p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-400">Repository</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            {loadingRepos ? (
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                                                </div>
                                            ) : null}

                                            {repos.length > 0 ? (
                                                <select
                                                    value={repoUrl}
                                                    onChange={(e) => {
                                                        setRepoUrl(e.target.value);
                                                        // Automatically load labels when repo changes
                                                        // We can trigger it via effect or manual call here
                                                        // Leteffect handle it since repoUrl changes
                                                    }}
                                                    className={`w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-blue-500 focus:outline-none ${loadingRepos ? 'pl-10' : ''}`}
                                                >
                                                    <option value="">Select a repository...</option>
                                                    {repos.map((repo) => (
                                                        <option key={repo.id} value={repo.html_url}>
                                                            {repo.full_name}
                                                        </option>
                                                    ))}
                                                    {/* Allow keeping custom URL if it's not in the list? */}
                                                    {repoUrl && !repos.some(r => r.html_url === repoUrl) && (
                                                        <option value={repoUrl}>{repoUrl} (Custom)</option>
                                                    )}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={repoUrl}
                                                    onChange={(e) => setRepoUrl(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-blue-500 focus:outline-none"
                                                    placeholder="https://github.com/owner/repo"
                                                />
                                            )}
                                        </div>

                                        <button
                                            onClick={loadRepos}
                                            disabled={loadingRepos || !token}
                                            className="flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-4 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                                            title="Refresh Repositories"
                                        >
                                            <RefreshCw className={`h-5 w-5 ${loadingRepos ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                    {repos.length > 0 && (
                                        <button
                                            onClick={() => setRepos([])}
                                            className="mt-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            Switch to manual URL input
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-800" />

                        {/* Swipe Actions Section */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Swipe Actions</h3>
                            <p className="text-sm text-gray-500">Configure which label is applied for each action.</p>

                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Left */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-yellow-500">Swipe Left (Later)</label>
                                    <select
                                        value={settings.swipeLeftLabel || ''}
                                        onChange={(e) => setSettings({ ...settings, swipeLeftLabel: e.target.value })}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">No Label</option>
                                        <option value="later">later (Default)</option>
                                        {labels.map(l => (
                                            <option key={l.id} value={l.name}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Up */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-red-500">Swipe Up (Close)</label>
                                    <select
                                        value={settings.swipeUpLabel || ''}
                                        onChange={(e) => setSettings({ ...settings, swipeUpLabel: e.target.value })}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">No Label</option>
                                        <option value="wontfix">wontfix (Default)</option>
                                        {labels.map(l => (
                                            <option key={l.id} value={l.name}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Right */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-green-500">Swipe Right (Assign)</label>
                                    <select
                                        value={settings.swipeRightLabel || ''}
                                        onChange={(e) => setSettings({ ...settings, swipeRightLabel: e.target.value || null })}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">No Label</option>
                                        {labels.map(l => (
                                            <option key={l.id} value={l.name}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-800" />

                        {/* Filters */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Filters</h3>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                                <input
                                    type="checkbox"
                                    id="skipLeft"
                                    checked={settings.skipIssuesWithSwipeLeftLabel}
                                    onChange={(e) => setSettings({ ...settings, skipIssuesWithSwipeLeftLabel: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                />
                                <label htmlFor="skipLeft" className="text-sm font-medium text-gray-300">
                                    Skip issues with label selected for <strong>Swipe Left</strong>
                                    {settings.swipeLeftLabel && <span className="ml-1 text-yellow-500">({settings.swipeLeftLabel})</span>}
                                </label>
                            </div>
                        </section>

                        {error && (
                            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-800 bg-gray-900 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
