import React, { useState, useEffect, useMemo } from 'react';
import { Search, Shield, User as UserIcon, Loader2, Users, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface UserProfile {
    id: string;
    full_name: string;
    role: 'admin' | 'user';
    email?: string;
}

interface UserManagementScreenProps {
    translations: {
        userManagement: string;
        searchUsers: string;
        noUsersFound: string;
        admin: string;
        user: string;
        promoteToAdmin: string;
        demoteToUser: string;
        roleUpdated: string;
        totalUsers: string;
        deleteUser: string;
        deleteUserConfirm: string;
        userDeleted: string;
    };
    currentUserId: string;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ translations: t, currentUserId }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .order('full_name', { ascending: true });

                if (profilesError) throw profilesError;

                const usersWithEmails: UserProfile[] = [];

                for (const profile of profiles || []) {
                    usersWithEmails.push({
                        id: profile.id,
                        full_name: profile.full_name || 'Unknown User',
                        role: profile.role || 'user',
                        email: undefined,
                    });
                }

                setUsers(usersWithEmails);
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.full_name.toLowerCase().includes(query) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
    }, [users, searchQuery]);

    const handleRoleToggle = async (userId: string, currentRole: 'admin' | 'user') => {
        if (userId === currentUserId) {
            alert('You cannot change your own role');
            return;
        }

        setUpdatingUserId(userId);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUserId) {
            alert('You cannot delete yourself');
            return;
        }

        if (!confirm(t.deleteUserConfirm)) {
            return;
        }

        setDeletingUserId(userId);

        try {
            // Delete from profiles table (auth.users deletion requires admin SDK)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setDeletingUserId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{t.userManagement}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t.totalUsers}: {users.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchUsers}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
            </div>

            {/* Users List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                        <Users size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">{t.noUsersFound}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin'
                                        ? 'bg-indigo-600 dark:bg-indigo-700'
                                        : 'bg-zinc-400 dark:bg-zinc-700'
                                        }`}>
                                        {user.full_name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-zinc-900 dark:text-white">{user.full_name}</h4>
                                        {user.email && (
                                            <p className="text-sm text-zinc-500">{user.email}</p>
                                        )}
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${user.role === 'admin'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                            {user.role === 'admin' ? t.admin : t.user}
                                        </span>
                                    </div>
                                </div>

                                {user.id !== currentUserId && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRoleToggle(user.id, user.role)}
                                            disabled={updatingUserId === user.id || deletingUserId === user.id}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${user.role === 'admin'
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {updatingUserId === user.id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                user.role === 'admin' ? t.demoteToUser : t.promoteToAdmin
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            disabled={updatingUserId === user.id || deletingUserId === user.id}
                                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={t.deleteUser}
                                        >
                                            {deletingUserId === user.id ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

