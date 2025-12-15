import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Removed unused react-query imports
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import CosmicCard from '@/components/cosmic/CosmicCard';
import GlowButton from '@/components/cosmic/GlowButton';
// Removed unused CosmicInput import
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Settings as SettingsIcon, User, Mail, 
  Moon, KeyRound, Sparkles, Heart, LogOut, Info, FileText, Shield, Camera, Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_photo: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118] to-transparent"
        >
          <Link to={createPageUrl('Home')} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <div className="w-10" />
        </motion.header>

        <div className="px-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <CosmicCard className="text-center py-8">
              <div className="relative inline-block mb-4">
                {user?.profile_photo ? (
                  <img 
                    src={user.profile_photo} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors border-2 border-[#0a0118]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </label>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {user?.full_name || 'Cosmic Seeker'}
              </h2>
              <p className="text-sm text-white/50">
                {user?.email || 'Exploring the universe'}
              </p>
            </CosmicCard>
          </motion.div>

          {/* Settings Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-sm text-white/50 uppercase tracking-wider mb-4">Account</h3>
            
            <CosmicCard className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Profile</p>
                <p className="text-xs text-white/50">Manage your profile details</p>
              </div>
            </CosmicCard>
            
            <CosmicCard className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Email</p>
                <p className="text-xs text-white/50">{user?.email || 'Not set'}</p>
              </div>
            </CosmicCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mt-8"
          >
            <h3 className="text-sm text-white/50 uppercase tracking-wider mb-4">App</h3>
            
            <CosmicCard 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">About Alchemize</p>
                <p className="text-xs text-white/50">Learn about the app</p>
              </div>
            </CosmicCard>

            <Link to={createPageUrl('Terms')}>
              <CosmicCard className="flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Terms & Conditions</p>
                  <p className="text-xs text-white/50">Legal terms of use</p>
                </div>
              </CosmicCard>
            </Link>

            <Link to={createPageUrl('Privacy')}>
              <CosmicCard className="flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Privacy Policy</p>
                  <p className="text-xs text-white/50">How we protect your data</p>
                </div>
              </CosmicCard>
            </Link>
            
            <CosmicCard className="flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Theme</p>
                <p className="text-xs text-white/50">Cosmic Dark (Default)</p>
              </div>
            </CosmicCard>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <GlowButton 
              onClick={handleLogout}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </GlowButton>
          </motion.div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-white/30">Alchemize v1.0</p>
            <p className="text-xs text-white/20 mt-1">Made with ✨ and 💜</p>
          </motion.div>
        </div>

        {/* About Dialog */}
        <Dialog open={showAbout} onOpenChange={setShowAbout}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-white" />
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