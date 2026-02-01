import React, { useState } from 'react';
import { X, Link as LinkIcon, Film, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { Video, CATEGORIES, Category } from '../types';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: Omit<Video, 'id' | 'createdAt' | 'views'>) => void;
  translations: {
    addNewContent: string;
    youtubeUrl: string;
    title: string;
    category: string;
    description: string;
    addToLibrary: string;
    invalidYoutubeUrl: string;
    videoTitlePlaceholder: string;
    descriptionPlaceholder: string;
    categories: Record<string, string>;
  };
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ isOpen, onClose, onAdd, translations: t }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Sermons');

  if (!isOpen) return null;

  // Accept normal videos AND YouTube Shorts in a robust way
  const extractYoutubeId = (input: string): string | null => {
    const trimmed = input.trim();

    // Regex patterns for different YouTube URL formats
    const patterns = [
      // YouTube Shorts: youtube.com/shorts/<id> or with query params
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      // Standard watch URL: youtube.com/watch?v=<id>
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
      // Short URL: youtu.be/<id>
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      // Embed URL: youtube.com/embed/<id>
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      // Old format: youtube.com/v/<id>
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Last resort: look for any 11-char YouTube video ID pattern
    const fallbackMatch = trimmed.match(/([a-zA-Z0-9_-]{11})/);
    return fallbackMatch ? fallbackMatch[1] : null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const youtubeId = extractYoutubeId(url);

    if (!youtubeId) {
      alert(t.invalidYoutubeUrl);
      return;
    }

    onAdd({
      youtubeId,
      title: title || 'New Video',
      description: description || 'No description provided',
      category,
      thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    });

    // Reset
    setUrl('');
    setTitle('');
    setDescription('');
    setCategory('Sermons');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 z-10"
      >

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.addNewContent}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <LinkIcon size={14} /> {t.youtubeUrl}
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or /shorts/..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Type size={14} /> {t.title}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.videoTitlePlaceholder}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Film size={14} /> {t.category}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${category === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                >
                  {t.categories[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{t.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all h-24 resize-none"
            />
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              {t.addToLibrary}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};