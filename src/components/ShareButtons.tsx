import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

interface ShareButtonsProps {
  url?: string;
  title: string;
  className?: string;
  label?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, className = '', label = 'Compartir esta oportunidad:' }) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(url || window.location.href);
  }, [url]);

  if (!currentUrl) return null;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={`flex flex-wrap items-center gap-3 text-sm text-slate-500 ${className}`}>
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {/* WhatsApp */}
        <a 
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
          aria-label="Compartir en WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </a>
        {/* X / Twitter */}
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Compartir en X (Twitter)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
          </svg>
        </a>
        {/* Telegram */}
        <a 
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors"
          aria-label="Compartir en Telegram"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </a>
        {/* Email */}
        <a 
          href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
          className="p-2 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Compartir por Email"
        >
          <Mail size={18} />
        </a>
      </div>
    </div>
  );
};
