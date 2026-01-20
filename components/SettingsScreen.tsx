import React from 'react';
import { Moon, Sun, Globe, Check } from 'lucide-react';
import { Theme, Language } from '../types';

interface SettingsScreenProps {
   theme: Theme;
   language: Language;
   setTheme: (t: Theme) => void;
   setLanguage: (l: Language) => void;
   translations: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
   theme, language, setTheme, setLanguage, translations
}) => {
   const t = translations;

   return (
      <div className="max-w-4xl mx-auto">
         <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{t.settings}</h2>

         <div className="space-y-6">
            {/* Appearance Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                     <Moon size={20} /> {t.appearance}
                  </h3>
               </div>
               <div className="p-6 flex items-center justify-between">
                  <div>
                     <p className="font-medium text-zinc-900 dark:text-zinc-100">{t.darkMode}</p>
                     <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.darkModeDesc}</p>
                  </div>
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
                     <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded-md flex items-center gap-2 transition-all ${theme === 'light' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                     >
                        <Sun size={18} />
                        <span className="text-sm font-medium hidden sm:inline">{t.light}</span>
                     </button>
                     <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-md flex items-center gap-2 transition-all ${theme === 'dark' ? 'bg-zinc-800 shadow-sm text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                     >
                        <Moon size={18} />
                        <span className="text-sm font-medium hidden sm:inline">{t.dark}</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Language Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                     <Globe size={20} /> {t.language}
                  </h3>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button
                        onClick={() => setLanguage('en')}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${language === 'en'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-950'
                           }`}
                     >
                        <span className="text-2xl">🇺🇸</span>
                        <div className="text-left">
                           <p className={`font-semibold ${language === 'en' ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-900 dark:text-white'}`}>English</p>
                           <p className="text-xs text-zinc-500">Default</p>
                        </div>
                        {language === 'en' && <div className="absolute top-4 end-4 text-indigo-500"><Check size={18} /></div>}
                     </button>

                     <button
                        onClick={() => setLanguage('ar')}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${language === 'ar'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-zinc-950'
                           }`}
                     >
                        <span className="text-2xl">🇪🇬</span>
                        <div className="text-left">
                           <p className={`font-semibold ${language === 'ar' ? 'text-indigo-700 dark:text-indigo-300' : 'text-zinc-900 dark:text-white'}`}>العربية</p>
                           <p className="text-xs text-zinc-500">Arabic</p>
                        </div>
                        {language === 'ar' && <div className="absolute top-4 end-4 text-indigo-500"><Check size={18} /></div>}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};