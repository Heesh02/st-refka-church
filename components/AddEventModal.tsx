import React, { useState } from 'react';
import { X, CalendarPlus, Type, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (event: { title: string; eventDate: string }) => void;
    translations: {
        addNewEvent: string;
        eventName: string;
        eventDate: string;
        eventTime: string;
        addEvent: string;
        eventNamePlaceholder: string;
    };
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAdd, translations: t }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !time) return;

        // Combine date and time into ISO string
        const eventDate = new Date(`${date}T${time}`).toISOString();

        onAdd({ title, eventDate });

        // Reset
        setTitle('');
        setDate('');
        setTime('');
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
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t.addNewEvent}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Event Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Type size={14} /> {t.eventName}
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t.eventNamePlaceholder}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <CalendarPlus size={14} /> {t.eventDate}
                        </label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} /> {t.eventTime}
                        </label>
                        <input
                            type="time"
                            required
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            {t.addEvent}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
