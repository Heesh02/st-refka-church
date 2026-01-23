import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from '../types';
import { supabase } from '../supabaseClient';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  currentUserId: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  currentUserId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      void loadComments();
    }
  }, [isOpen, videoId]);

  const loadComments = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('Loading comments for video:', videoId);

      // Fetch comments without the problematic foreign key join
      const { data, error } = await supabase
        .from('video_comments')
        .select('id, video_id, user_id, content, created_at, updated_at')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      // eslint-disable-next-line no-console
      console.log('Comments query result:', { data, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs to fetch their profiles
      const userIds = [...new Set(data.map((item: any) => item.user_id))];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Create a map of user_id -> full_name
      const profileMap = new Map<string, string>();
      profiles?.forEach((profile: any) => {
        profileMap.set(profile.id, profile.full_name);
      });

      const mappedComments: Comment[] =
        data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          userName: profileMap.get(item.user_id) || 'Anonymous',
          videoId: item.video_id,
          content: item.content,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

      // eslint-disable-next-line no-console
      console.log('Mapped comments:', mappedComments);

      setComments(mappedComments);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('video_comments').insert({
        video_id: videoId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setNewComment('');
      void loadComments();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error adding comment:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to add comment: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('video_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      void loadComments();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('video_comments')
        .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
      void loadComments();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Comments</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
              {videoTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        ref={textareaRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-zinc-900 dark:text-white">
                            {comment.userName}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(comment.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {comment.userId === currentUserId && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(comment)}
                              className="p-1.5 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Edit comment"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

