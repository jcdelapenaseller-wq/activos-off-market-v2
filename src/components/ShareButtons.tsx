import React, { useState, useRef, useEffect } from 'react';
import { Share2, MessageCircle, Twitter, Linkedin, Mail, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { trackConversion, TrackingOrigin } from '../utils/tracking';

interface ShareButtonsProps {
  url?: string;
  title: string;
  text?: string;
  className?: string;
  label?: string;
  variant?: 'minimal' | 'outline' | 'ghost';
  province?: string;
  origin?: TrackingOrigin;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ 
  url, 
  title, 
  text,
  className = '',
  label = 'Compartir:',
  variant = 'minimal',
  province = 'España',
  origin = 'ficha'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUrl = url || window.location.href;
  const fullUrl = currentUrl.startsWith('http') ? currentUrl : `${window.location.origin}${currentUrl}`;
  const shareText = text || title;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleShare = async () => {
    // Track open
    if (!isOpen) {
      trackConversion(province, origin, 'share_open');
    }

    // Try Web Share API first on mobile
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl,
        });
        return;
      } catch (err) {
        console.log('Web Share failed or cancelled', err);
        // Fallback to dropdown if not cancelled by user
        if ((err as Error).name !== 'AbortError') {
          setIsOpen(!isOpen);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = () => {
    trackConversion(province, origin, 'share_copy');
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={16} />,
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`,
      color: 'hover:text-green-600',
      track: 'share_whatsapp' as const
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter size={16} />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      color: 'hover:text-black',
      track: 'share_x' as const
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={16} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      color: 'hover:text-blue-700',
      track: 'share_linkedin' as const
    },
    {
      name: 'Email',
      icon: <Mail size={16} />,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`,
      color: 'hover:text-red-500',
      track: 'share_email' as const
    }
  ];

  const buttonStyles = {
    minimal: "text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100",
    outline: "flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-full text-[10px] md:text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider",
    ghost: "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider"
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {label && <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden md:inline">{label}</span>}
        <button
          onClick={handleShare}
          className={buttonStyles[variant]}
          title="Compartir"
        >
          <Share2 size={16} className="md:hidden" />
          <Share2 size={18} className="hidden md:block" />
          {variant !== 'minimal' && <span>Compartir</span>}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 mb-1 border-bottom border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compartir en</span>
            </div>
            
            {/* 1. WhatsApp */}
            <a
              href={shareLinks[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors ${shareLinks[0].color}`}
              onClick={() => {
                trackConversion(province, origin, shareLinks[0].track);
                setIsOpen(false);
              }}
            >
              {shareLinks[0].icon}
              <span>{shareLinks[0].name}</span>
            </a>

            {/* 2. Copiar enlace */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
            </button>

            <div className="h-px bg-slate-50 my-1" />

            {/* 3, 4, 5. X, LinkedIn, Email */}
            {shareLinks.slice(1).map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors ${link.color}`}
                onClick={() => {
                  trackConversion(province, origin, link.track);
                  setIsOpen(false);
                }}
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
