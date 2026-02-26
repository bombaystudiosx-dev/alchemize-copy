import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  User, Mail, Info, FileText, Shield, Eye, Bluetooth, Heart, Palette, 
  Trash2, LogOut, ChevronLeft, Sparkles, Moon, Crown, Bug
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SettingsRow from '@/components/settings/SettingsRow';
import DeleteAccountFlow from '@/components/settings/DeleteAccountFlow';
import FeatureManager from '@/components/home/FeatureManager';
import { isDevMode, setDevMode } from '@/components/subscription/subscriptionHelper';
import BluetoothDialog from '@/components/settings/BluetoothDialog';
import AppleHealthDialog from '@/components/settings/AppleHealthDialog';
import ThemeDialog from '@/components/settings/ThemeDialog';
import ResetDataDialog from '@/components/settings/ResetDataDialog';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showBluetooth, setShowBluetooth] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showResetData, setShowResetData] = useState(false);
  const [devModeOn, setDevModeOn] = useState(() => isDevMode());

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const currentTheme = localStorage.getItem('app_theme') || 'cosmic-dark';
  const themeLabel = {
    'cosmic-dark': 'Cosmic Dark',
    'midnight-blue': 'Midnight Blue',
    'aurora': 'Aurora',
    'rose-gold': 'Rose Gold'
  }[currentTheme] || 'Cosmic Dark';

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center px-4 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118]/95 to-transparent backdrop-blur-sm"
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-base font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center mr-16">Settings</h1>
        </motion.header>

        <div className="px-4 space-y-6">
          {/* ACCOUNT Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest mb-3 px-1">Account</h3>
            <div className="space-y-2">
              <Link to={createPageUrl('Profile')}>
                <SettingsRow
                  icon={User}
                  iconBg="bg-purple-500/20"
                  iconColor="text-purple-400"
                  title="Profile"
                  subtitle="Manage your profile details"
                  onClick={() => {}}
                />
              </Link>
              <SettingsRow
                icon={Mail}
                iconBg="bg-blue-500/20"
                iconColor="text-blue-400"
                title="Email"
                subtitle={user?.email || 'Not set'}
              />
            </div>
          </motion.div>

          {/* PREMIUM Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest mb-3 px-1">Premium</h3>
            <div className="space-y-2">
              {user?.subscription_status === 'active' || user?.subscription_status === 'trialing' ? (
                <SettingsRow
                  icon={Crown}
                  iconBg="bg-amber-500/20"
                  iconColor="text-amber-400"
                  title="Alchemize Premium"
                  subtitle={user?.subscription_status === 'trialing' ? 'Free Trial Active' : 'Active Subscription'}
                  onClick={async () => {
                    if (window.self !== window.top) {
                      alert('Manage subscription from the published app.');
                      return;
                    }
                    try {
                      const res = await base44.functions.invoke('createPortalSession');
                      if (res.data?.url) window.location.href = res.data.url;
                    } catch (e) {
                      alert('Could not open subscription management.');
                    }
                  }}
                />
              ) : (
                <Link to={createPageUrl('Premium')}>
                  <SettingsRow
                    icon={Crown}
                    iconBg="bg-amber-500/20"
                    iconColor="text-amber-400"
                    title="Alchemize Premium"
                    subtitle="Unlock advanced manifestation tools"
                    onClick={() => {}}
                  />
                </Link>
              )}
            </div>
          </motion.div>

          {/* APP Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest mb-3 px-1">App</h3>
            <div className="space-y-2">
              <SettingsRow
                icon={Info}
                iconBg="bg-purple-500/20"
                iconColor="text-purple-400"
                title="About Alchemize"
                subtitle="Learn more about the app"
                onClick={() => setShowAbout(true)}
              />
              <Link to={createPageUrl('Terms')}>
                <SettingsRow
                  icon={FileText}
                  iconBg="bg-blue-500/20"
                  iconColor="text-blue-400"
                  title="Terms & Conditions"
                  subtitle="Read our terms of service"
                  onClick={() => {}}
                />
              </Link>
              <Link to={createPageUrl('Privacy')}>
                <SettingsRow
                  icon={Shield}
                  iconBg="bg-purple-500/20"
                  iconColor="text-purple-400"
                  title="Privacy Policy"
                  subtitle="How we handle your data"
                  onClick={() => {}}
                />
              </Link>
              <SettingsRow
                icon={Eye}
                iconBg="bg-pink-500/20"
                iconColor="text-pink-400"
                title="Manage Features"
                subtitle="Choose which features to display"
                onClick={() => setShowFeatures(true)}
              />
              <SettingsRow
                icon={Bluetooth}
                iconBg="bg-blue-600/20"
                iconColor="text-blue-400"
                title="Bluetooth Devices"
                subtitle="Scan and connect to devices"
                onClick={() => setShowBluetooth(true)}
              />
              <SettingsRow
                icon={Heart}
                iconBg="bg-red-500/20"
                iconColor="text-red-400"
                title="Apple Health"
                subtitle="Sync workouts from Apple Watch & Ring"
                onClick={() => setShowHealth(true)}
              />
              <SettingsRow
                icon={Palette}
                iconBg="bg-indigo-500/20"
                iconColor="text-indigo-400"
                title="Theme"
                subtitle={themeLabel}
                onClick={() => setShowTheme(true)}
              />

              <SettingsRow
                icon={Shield}
                iconBg="bg-amber-500/20"
                iconColor="text-amber-400"
                title="Dev Mode (Bypass Paywalls)"
                subtitle={devModeOn ? 'All features unlocked' : 'Paywalls active'}
                toggle
                checked={devModeOn}
                onToggle={(val) => { setDevMode(val); setDevModeOn(val); }}
              />
              {user?.role === 'admin' && (
                <Link to={createPageUrl('Diagnostics')}>
                  <SettingsRow
                    icon={Bug}
                    iconBg="bg-green-500/20"
                    iconColor="text-green-400"
                    title="Diagnostics"
                    subtitle="System checks & event log"
                    onClick={() => {}}
                  />
                </Link>
              )}
            </div>
          </motion.div>

          {/* DATA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest mb-3 px-1">Data</h3>
            <div className="space-y-2">
              <div onClick={() => setShowResetData(true)}>
                <SettingsRow
                  icon={Trash2}
                  iconBg="bg-red-500/20"
                  iconColor="text-red-400"
                  title="Reset All Data"
                  subtitle="Permanently delete all app data"
                  onClick={() => setShowResetData(true)}
                />
              </div>
              <div onClick={() => setShowDeleteAccount(true)}>
                <SettingsRow
                  icon={Trash2}
                  iconBg="bg-red-600/20"
                  iconColor="text-red-500"
                  title="Delete Account"
                  subtitle="Permanently delete your account and all data"
                  onClick={() => setShowDeleteAccount(true)}
                />
              </div>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="pt-2"
          >
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-center justify-center gap-2 text-red-400 font-semibold text-base hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </motion.div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pb-4"
          >
            <p className="text-xs text-white/30">Alchemize v1.0.0</p>
          </motion.div>
        </div>

        {/* Dialogs */}
        <DeleteAccountFlow open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />
        <FeatureManager open={showFeatures} onOpenChange={setShowFeatures} />
        <BluetoothDialog open={showBluetooth} onOpenChange={setShowBluetooth} />
        <AppleHealthDialog open={showHealth} onOpenChange={setShowHealth} />
        <ThemeDialog open={showTheme} onOpenChange={setShowTheme} />
        <ResetDataDialog open={showResetData} onOpenChange={setShowResetData} />

        {/* About Dialog */}
        <Dialog open={showAbout} onOpenChange={setShowAbout}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4 py-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-indigo-300">
                Alchemize
              </h2>
              
              <p className="text-purple-200/80 text-lg">
                Unlock Your Highest Self
              </p>
              
              <div className="py-4 space-y-3 text-sm text-white/60 leading-relaxed">
                <p>
                  Alchemize is your personal transformation companion, designed to help you manifest your dreams and become the best version of yourself.
                </p>
                <p>
                  Through manifestation boards, affirmations, goal setting, habit tracking, and holistic life management tools, Alchemize empowers you to create positive change in every area of your life.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <Moon className="w-6 h-6 text-indigo-400" />
                <Heart className="w-6 h-6 text-pink-400" />
              </div>

              <p className="text-xs text-white/40">
                Transform your reality, one intention at a time.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CosmicBackground>
  );
}