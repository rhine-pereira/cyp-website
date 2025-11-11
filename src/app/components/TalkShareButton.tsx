'use client';

import React from 'react';
import { Share2, Check, Link as LinkIcon, MessageCircle, Mail } from 'lucide-react';

interface TalkShareButtonProps {
  title?: string;
}

export default function TalkShareButton({ title }: TalkShareButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const shareTitle = title || document.title;

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowMenu(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const copyWithExecCommand = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '1px';
      ta.style.height = '1px';
      ta.style.padding = '0';
      ta.style.border = 'none';
      ta.style.outline = 'none';
      ta.style.boxShadow = 'none';
      ta.style.background = 'transparent';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  };

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // Native share (preferred)
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      try {
        await (navigator as any).share({ title: shareTitle, text: shareTitle, url });
        setBusy(false);
        return;
      } catch (err) {
        // user may cancel or it may fail — fall through to next methods
      }
    }

    // Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setBusy(false);
        return;
      } catch (err) {
        // fallback to execCommand
      }
    }

    // execCommand fallback
    const ok = copyWithExecCommand(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setBusy(false);
      return;
    }

    // Show share menu with app-specific intents (WhatsApp, Telegram, SMS, Email)
    setShowMenu(true);
    setBusy(false);
  };

  const openWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${shareTitle} - ${url}`;
    const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(wa, '_blank');
    setShowMenu(false);
  };

  const openTelegram = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(tg, '_blank');
    setShowMenu(false);
  };

  const openSMS = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const body = encodeURIComponent(`${shareTitle} ${url}`);
    // Using sms: without number; behavior varies across platforms
    window.location.href = `sms:?body=${body}`;
    setShowMenu(false);
  };

  const openEmail = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(url);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  const doCopy = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        copyWithExecCommand(url) && setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      copyWithExecCommand(url) && setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this talk"
        title="Share this talk"
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
        <span>{copied ? 'Link copied' : 'Share'}</span>
      </button>

      {showMenu && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
          <div className="py-1">
            <button onClick={openWhatsApp} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.373 0 .001 5.372.001 12c0 2.11.55 4.086 1.6 5.84L0 24l6.407-1.64A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.98-.49-3.84-1.48-5.52z"/></svg>
              WhatsApp
            </button>
            <button onClick={openTelegram} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.371 0 0 5.371 0 12s5.371 12 12 12 12-5.371 12-12S18.629 0 12 0zM17.04 7.017l-1.88 8.858c-.14.597-.51.745-1.03.464l-2.84-2.096-1.37 1.318c-.152.152-.28.28-.574.28l.205-2.905 5.29-4.77c.23-.205-.05-.32-.355-.115l-6.54 4.11-2.82-.885c-.612-.193-.624-.612.128-.9L16.3 6.1c.53-.195.993.128.74.917z"/></svg>
              Telegram
            </button>
            <button onClick={openSMS} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              SMS
            </button>
            <button onClick={openEmail} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </button>
            <div className="border-t my-1" />
            <button onClick={doCopy} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Copy link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

