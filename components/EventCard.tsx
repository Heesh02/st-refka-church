import React from 'react';
import { CalendarPlus, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChurchEvent } from '../types';

interface EventCardProps {
    event: ChurchEvent;
    onDelete?: (id: string) => void;
    translations: {
        addToCalendar: string;
        deleteEventConfirm: string;
    };
    language: string;
}

/**
 * Generate an .ics file content string for a given event.
 * The event is set to 1 hour duration by default.
 */
function generateICS(event: ChurchEvent): string {
    const start = new Date(event.eventDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const fmt = (d: Date) =>
        d
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}/, '');

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//St. Refka Church//Media Center//EN',
        'BEGIN:VEVENT',
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:Church Event - ${event.title}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

function downloadICS(event: ChurchEvent) {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete, translations: t, language }) => {
    const eventDate = new Date(event.eventDate);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';

    const formattedDate = eventDate.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = eventDate.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isPast = eventDate < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${isPast ? 'opacity-60' : ''}`}
        >
            {/* Delete button for admins */}
            {onDelete && (
                <button
                    onClick={() => {
                        if (confirm(t.deleteEventConfirm)) {
                            onDelete(event.id);
                        }
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-400/10"
                >
                    <Trash2 size={16} />
                </button>
            )}

            {/* Event Title */}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 pr-8">
                {event.title}
            </h3>

            {/* Date & Time */}
            <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CalendarPlus size={16} className="text-indigo-500 shrink-0" />
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Clock size={16} className="text-indigo-500 shrink-0" />
                    <span>{formattedTime}</span>
                </div>
            </div>

            {/* Add to Calendar */}
            {!isPast && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadICS(event)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
                >
                    <CalendarPlus size={16} />
                    {t.addToCalendar}
                </motion.button>
            )}
        </motion.div>
    );
};
