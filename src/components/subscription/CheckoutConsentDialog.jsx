import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CheckoutConsentDialog({ open, onOpenChange, onAccept, loading }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a0a2e] border-purple-500/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Before You Continue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2 text-sm text-white/70">
          <p>Please review and accept the Terms and Conditions before continuing to Stripe.</p>
          <div className="rounded-xl bg-white/[0.05] border border-white/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox checked={accepted} onCheckedChange={(value) => setAccepted(!!value)} />
              <label className="text-sm text-white/80 leading-relaxed">
                I agree to the <Link to={createPageUrl('Terms')} className="text-purple-300 underline">Terms and Conditions</Link> and understand that my subscription will be billed through Stripe.
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAccept()}
            disabled={!accepted || loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Agree and Continue'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}