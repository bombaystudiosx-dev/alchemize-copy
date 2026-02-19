import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';

export default function DeleteAccountFlow({ open, onOpenChange }) {
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setStep(1);
    setConfirmed(false);
    setConfirmText('');
    setDeleting(false);
    setError(null);
  };

  const handleOpenChange = (open) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFinalDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('deleteAccount', {});
      if (response.data?.ok) {
        // Success — log out immediately
        base44.auth.logout('/');
      } else {
        setError(response.data?.error || 'Deletion failed. Please try again.');
        setDeleting(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-red-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Warning */}
        {step === 1 && (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <h3 className="font-semibold text-red-400 mb-2">⚠️ This action is permanent</h3>
              <ul className="text-sm text-white/70 space-y-2">
                <li>• All your data will be permanently deleted</li>
                <li>• Your habits, goals, journal entries, and financial data will be erased</li>
                <li>• Your manifestation board and affirmations will be removed</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-red-500"
              />
              <span className="text-sm text-white/80">
                I understand that deleting my account is permanent and all my data will be lost forever.
              </span>
            </label>

            <button
              onClick={() => setStep(2)}
              disabled={!confirmed}
              className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-500/30 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Type DELETE to confirm */}
        {step === 2 && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-white/70">
              To confirm deletion, please type <span className="text-red-400 font-bold">DELETE</span> below:
            </p>
            
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE"'
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 outline-none focus:border-red-500/50"
              autoComplete="off"
              autoCapitalize="characters"
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleFinalDelete}
              disabled={confirmText !== 'DELETE' || deleting}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                'Permanently Delete My Account'
              )}
            </button>

            <button
              onClick={() => handleOpenChange(false)}
              disabled={deleting}
              className="w-full py-2 text-white/50 text-sm hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}