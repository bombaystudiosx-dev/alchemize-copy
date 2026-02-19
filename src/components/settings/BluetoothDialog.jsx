import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bluetooth, Loader2, AlertCircle } from 'lucide-react';

export default function BluetoothDialog({ open, onOpenChange }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    
    // Check if Web Bluetooth API is available
    if (!navigator.bluetooth) {
      setError('Bluetooth is not available on this device or browser. Try using Chrome on Android or a desktop device.');
      setScanning(false);
      return;
    }

    try {
      await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service']
      });
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setError('Bluetooth scan was cancelled or failed. Please try again.');
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#0d0620] border-purple-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-blue-400" />
            Bluetooth Devices
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <p className="text-sm text-white/60">
            Scan for nearby Bluetooth devices to connect fitness trackers, heart rate monitors, and other accessories.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-200/80">{error}</p>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full py-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4" />
                Scan for Devices
              </>
            )}
          </button>

          <p className="text-xs text-white/30 text-center">
            Requires a compatible browser with Web Bluetooth support
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}