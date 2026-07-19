import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Command, Building2, Users, Receipt, Calendar, 
  Clock, Briefcase, Wallet, Percent, Lock, BarChart4, 
  Settings, LogOut, ShieldCheck, ChevronRight, CornerDownLeft,
  Sparkles, Globe, Eye, RefreshCw, Bell, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  onOpenModal: (modalId: string) => void;
  onSignOut: () => void;
  onRefreshData: () => void;
  activeTab: string;
  navItems: Array<{ id: string, label: string, icon: any }>;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenModal,
  onSignOut,
  onRefreshData,
  activeTab,
  navItems
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle global Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            handleSelect(filteredOptions[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Combine items into options list
  const getOptions = () => {
    const options: Array<{
      id: string;
      label: string;
      category: 'Navigation' | 'Actions' | 'Settings';
      icon: any;
      action: () => void;
      shortcut?: string;
    }> = [];

    // 1. Navigation items (dashboard tabs)
    navItems.forEach((item) => {
      options.push({
        id: `nav-${item.id}`,
        label: `Go to ${item.label}`,
        category: 'Navigation',
        icon: item.icon,
        action: () => onNavigate(item.id),
      });
    });

    // 2. Settings Modals
    const modals = [
      { id: 'profile', label: 'Edit Profile Identifiers', icon: User },
      { id: 'settings', label: 'Configure Workspace Settings', icon: Settings },
      { id: 'notifications', label: 'Configure System Alerts', icon: Bell },
      { id: 'language', label: 'Switch Operating Language', icon: Globe },
      { id: 'privacy', label: 'View Isolation Certificates & Keys', icon: ShieldCheck },
    ];

    modals.forEach((modal) => {
      options.push({
        id: `modal-${modal.id}`,
        label: modal.label,
        category: 'Settings',
        icon: modal.icon,
        action: () => onOpenModal(modal.id),
      });
    });

    // 3. Actions
    options.push({
      id: 'action-refresh',
      label: 'Force Cloud Synchronization (Refresh)',
      category: 'Actions',
      icon: RefreshCw,
      action: onRefreshData,
      shortcut: 'R',
    });

    options.push({
      id: 'action-signout',
      label: 'Terminate Workspace Session (Sign Out)',
      category: 'Actions',
      icon: LogOut,
      action: onSignOut,
      shortcut: '⇧ ⌕ Q',
    });

    return options;
  };

  const allOptions = getOptions();

  // Filter options based on query
  const filteredOptions = allOptions.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase()) ||
    opt.category.toLowerCase().includes(query.toLowerCase())
  );

  // Set selected index limits
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (option: typeof allOptions[0]) => {
    option.action();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="command-palette-overlay" className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            id="command-palette-backdrop"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: -20, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            ref={containerRef}
            className="bg-zinc-950/90 border border-zinc-850 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl text-zinc-100 z-10"
            id="command-palette-box"
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-850">
              <Search className="h-5 w-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search modules..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none border-none font-medium"
                id="command-palette-input"
              />
              <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono rounded-lg font-bold">
                ESC
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-[350px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {filteredOptions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                  <Command className="h-6 w-6 text-zinc-600 animate-pulse" />
                  <span>No matching commands or modules found.</span>
                </div>
              ) : (
                // Group by Category
                Object.entries(
                  filteredOptions.reduce((acc, opt) => {
                    if (!acc[opt.category]) acc[opt.category] = [];
                    acc[opt.category].push(opt);
                    return acc;
                  }, {} as Record<string, typeof filteredOptions>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    {/* Category Title */}
                    <div className="px-3 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      {category}
                    </div>

                    {/* Items */}
                    {items.map((item) => {
                      const Icon = item.icon;
                      const globalIndex = filteredOptions.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-100 ${
                            isSelected 
                              ? 'bg-white text-zinc-950 shadow-md scale-[1.01]' 
                              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                          }`}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-900 text-zinc-400'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.shortcut && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-zinc-150 text-zinc-800' : 'bg-zinc-900 text-zinc-500'
                              }`}>
                                {item.shortcut}
                              </span>
                            )}
                            {isSelected && (
                              <CornerDownLeft className={`h-3 w-3 ${
                                isSelected ? 'text-zinc-900' : 'text-zinc-500'
                              }`} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer Shortcut Guide */}
            <div className="px-4 py-2.5 border-t border-zinc-850 bg-[#070708] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded">Enter</span> Select
                </span>
              </div>
              <div className="flex items-center gap-1 text-zinc-400">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                <span>Cameroon Workspace v2.6 Power Shell</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
