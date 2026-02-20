import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CosmicBackground from '@/components/cosmic/CosmicBackground';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Check, Loader2 } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      setFullName(u.full_name || '');
      setBio(u.bio || '');
      setProfilePicture(u.profile_picture || '');
    };
    load();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProfilePicture(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      bio,
      profile_picture: profilePicture,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-4 sticky top-0 z-50 bg-gradient-to-b from-[#0a0118]/95 to-transparent backdrop-blur-sm"
        >
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white">
            <ChevronLeft className="w-6 h-6" />
            <span className="text-base font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-purple-400 font-semibold text-base disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5 text-green-400" /> : 'Save'}
          </button>
        </motion.header>

        <div className="px-5 space-y-8">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 pt-4"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/40 bg-white/10 flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                ) : profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" style={{ pointerEvents: 'auto' }} />
                ) : (
                  <span className="text-3xl font-bold text-white/70">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center border-2 border-[#0a0118] shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-white/40 text-xs">Tap camera to change photo</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            {/* Name (read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest px-1">Name</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white/50 text-base">
                {fullName || 'Not set'}
              </div>
              <p className="text-white/30 text-xs px-1">Name is managed by your login provider</p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest px-1">Email</label>
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white/50 text-base">
                {user?.email || 'Not set'}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-400/80 uppercase tracking-widest px-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 text-base focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>
          </motion.div>

          {/* Saved indicator */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                <Check className="w-4 h-4" />
                Profile saved
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </CosmicBackground>
  );
}