import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Flame, 
  Volume2, 
  Send
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyReminderEnabled: boolean;
  reminderTime: string;
  onUpdateReminderSettings: (enabled: boolean, time: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  dailyReminderEnabled,
  reminderTime,
  onUpdateReminderSettings
}) => {
  const [enabled, setEnabled] = useState(dailyReminderEnabled);
  const [time, setTime] = useState(reminderTime || '08:00');
  const [testSent, setTestSent] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm === 'granted') {
        new Notification("Hamdaan Studies Pro", {
          body: "Daily Study Reminder notifications enabled! Keep your streak and GPA strong.",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const handleSendTestNotification = () => {
    soundManager.playCompletionChime();
    setTestSent(true);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification("Hamdaan Studies Pro: Study Time!", {
        body: "Today's daily focus session is ready. Physics and Mathematics 1 need your attention!",
      });
    }

    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateReminderSettings(enabled, time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/20 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Daily Study Reminders
              </h3>
              <p className="text-xs text-slate-400">
                Automated study alerts &amp; streak preservation
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl"
          >
            ✕
          </button>
        </div>

        {/* Browser Permission Request */}
        {permissionState !== 'granted' && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Browser Notifications
            </div>
            <p className="text-xs text-slate-300">
              Allow browser notifications to receive study alerts even when you are working on other browser tabs.
            </p>
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              Enable Browser Alerts
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <div>
              <span className="text-sm font-bold text-white block">Enable Daily Notification</span>
              <span className="text-xs text-slate-400">Alert me when it's study time</span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time Picker */}
          {enabled && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Reminder Time Every Day
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-white font-mono text-sm"
                required
              />
              <p className="text-[11px] text-slate-400">
                Recommended: 08:00 AM (Morning focus) or 06:00 PM (Evening sprint).
              </p>
            </div>
          )}

          {/* Test Notification Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>{testSent ? '✓ Alert Chime Sent!' : 'Send Test Notification'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
