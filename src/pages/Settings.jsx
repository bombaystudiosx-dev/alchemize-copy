import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  User, Mail, Info, FileText, Shield, Eye, Bluetooth, Heart, Palette,
  Trash2, LogOut, ChevronLeft, Sparkles, Moon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SettingsRow from '@/components/settings/SettingsRow';
import DeleteAccountFlow from '@/components/settings/DeleteAccountFlow';
import FeatureManager from '@/components/home/FeatureManager';

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
  const [themeLabel, setThemeLabel] = useState(localStorage.getItem('theme') || 'Cosmic Dark');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate('/');
  };

  return (
    <CosmicBackground className="min-h-screen">
      <div className="max-w-2xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-safe">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10" aria-label="Go back">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>

        {/* ACCOUNT Section */}
        <div>
          <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider px-4 mb-2">Account</h3>
          <div className="space-y-2">
            <SettingsRow
              icon={User}
              iconBg="bg-purple-500/20"
              iconColor="text-purple-400"
              title={user?.full_name || 'Your Name'}
              subtitle={user?.email || 'Not set'}
            />
          </div>
        </div>

        {/* APP Section */}
        <div>
          <h3 className="text-xs font-semibold text-purple-400/80 uppercase tracking-wider px-4 mb-2 mt-6">App</h3>
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
          </div>
        </div>

        {/* DANGER Section */}
        <div>
          <h3 className="text-xs font-semibold text-red-400/80 uppercase tracking-wider px-4 mb-2 mt-6">Danger Zone</h3>
          <div className="space-y-2">
            <SettingsRow
              icon={Trash2}
              iconBg="bg-red-500/20"
              iconColor="text-red-400"
              title="Reset All Data"
              subtitle="Permanently delete all your data"
              onClick={() => setShowResetData(true)}
            />
            <SettingsRow
              icon={Trash2}
              iconBg="bg-red-500/20"
              iconColor="text-red-400"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onClick={() => setShowDeleteAccount(true)}
            />
            <SettingsRow
              icon={LogOut}
              iconBg="bg-gray-500/20"
              iconColor="text-gray-400"
              title="Sign Out"
              subtitle="Log out of your account"
              onClick={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">About Alchemize</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Alchemize is your all-in-one personal growth companion.</p>
            <p className="text-gray-400 text-xs">Version 1.0.0</p>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteAccountFlow open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />
      <FeatureManager open={showFeatures} onOpenChange={setShowFeatures} />
      <BluetoothDialog open={showBluetooth} onOpenChange={setShowBluetooth} />
      <AppleHealthDialog open={showHealth} onOpenChange={setShowHealth} />
      <ThemeDialog open={showTheme} onOpenChange={setShowTheme} onThemeChange={setThemeLabel} />
      <ResetDataDialog open={showResetData} onOpenChange={setShowResetData} />
    </CosmicBackground>
  );
}