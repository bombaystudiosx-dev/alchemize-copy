import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ClipboardCopy, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getEvents, clearEvents, copyReport } from '@/components/common/appLogger';
import useBackNav from '@/components/common/useBackNav';
import CosmicBackground from '@/components/cosmic/CosmicBackground';

function StatusBadge({ status }) {
  if (status === 'pending') return <Loader2 className="w-4 h-4 text-white/40 animate-spin" />;
  if (status === 'pass') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  if (status === 'fail') return <XCircle className="w-4 h-4 text-red-400" />;
  return null;
}

function DiagRow({ label, status, detail }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/10">
      <StatusBadge status={status} />
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{label}</p>
        {detail && <p className={`text-xs mt-0.5 ${status === 'fail' ? 'text-red-400' : 'text-white/40'}`}>{detail}</p>}
      </div>
    </div>
  );
}

export default function Diagnostics() {
  const goBack = useBackNav('Settings', 'Diagnostics');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checks, setChecks] = useState({
    auth: { status: 'pending', detail: '' },
    dbWrite: { status: 'pending', detail: '' },
    subscription: { status: 'pending', detail: '' },
  });
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLogs(getEvents());
    base44.auth.me().then(u => {
      setUser(u);
      setIsAdmin(u?.role === 'admin');
    }).catch(() => {});
  }, []);

  const runDiagnostics = async () => {
    setRunning(true);
    const update = (key, status, detail) =>
      setChecks(prev => ({ ...prev, [key]: { status, detail } }));

    // Auth check
    try {
      const u = await base44.auth.me();
      update('auth', 'pass', `${u.email} (${u.role})`);
    } catch (e) {
      update('auth', 'fail', e.message);
    }

    // DB write test — create + delete a GratitudeEntry
    try {
      const rec = await base44.entities.GratitudeEntry.create({
        gratitude_1: '__diag_test__',
        date: new Date().toISOString().split('T')[0]
      });
      await base44.entities.GratitudeEntry.delete(rec.id);
      update('dbWrite', 'pass', 'Create + delete successful');
    } catch (e) {
      update('dbWrite', 'fail', e.message);
    }

    // Subscription check
    try {
      const u = await base44.auth.me();
      const status = u.subscription_status || 'none';
      update('subscription', status === 'active' || status === 'trialing' ? 'pass' : 'pass', `Status: ${status}`);
    } catch (e) {
      update('subscription', 'fail', e.message);
    }

    setLogs(getEvents());
    setRunning(false);
  };

  const handleCopy = () => {
    copyReport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CosmicBackground>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0118]/95 to-transparent backdrop-blur-sm px-4 py-4 flex items-center gap-3">
          <button onClick={goBack} className="flex items-center gap-1 text-white">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-white flex-1 text-center mr-16">Diagnostics</h1>
        </div>

        <div className="px-4 space-y-6">
          {!isAdmin && user && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4">
              <p className="text-red-300 text-sm text-center">Admin access required.</p>
            </div>
          )}

          {/* Checks */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">System Checks</h2>
              <button
                onClick={runDiagnostics}
                disabled={running}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm disabled:opacity-50 flex items-center gap-1"
              >
                {running && <Loader2 className="w-3 h-3 animate-spin" />}
                Run All
              </button>
            </div>
            <DiagRow label="Auth / Current User" status={checks.auth.status} detail={checks.auth.detail} />
            <DiagRow label="DB Write Test (create+delete)" status={checks.dbWrite.status} detail={checks.dbWrite.detail} />
            <DiagRow label="Subscription Status" status={checks.subscription.status} detail={checks.subscription.detail} />
          </div>

          {/* Smoke Test Checklist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="text-white font-semibold mb-3">Smoke Test Checklist</h2>
            {[
              { label: 'Gratitude Journal — add entry', screen: 'Journal' },
              { label: 'Affirmations — add new', screen: 'Affirmations' },
              { label: 'Goals — create goal', screen: 'Goals' },
              { label: 'Finance — add expense', screen: 'Finance' },
              { label: 'Habits — mark complete', screen: 'Habits' },
              { label: 'Fitness — log workout', screen: 'Fitness' },
              { label: 'Premium paywall + Restore', screen: 'Premium' },
              { label: 'Settings — sign out', screen: 'Settings' },
            ].map(({ label, screen }) => (
              <SmokeRow key={screen} label={label} screen={screen} />
            ))}
          </div>

          {/* Event Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Recent Events ({logs.length})</h2>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs flex items-center gap-1">
                  <ClipboardCopy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => { clearEvents(); setLogs([]); }} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 && <p className="text-white/30 text-xs text-center py-4">No events yet</p>}
              {logs.map((e, i) => (
                <div key={i} className="flex items-start gap-2 py-1 border-b border-white/5">
                  <span className={`text-xs font-mono flex-shrink-0 ${e.status === 'fail' ? 'text-red-400' : 'text-green-400'}`}>
                    {e.status === 'fail' ? '✗' : '✓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{e.screen} › {e.action}</p>
                    {e.error && <p className="text-xs text-red-400 truncate">{e.error}</p>}
                  </div>
                  <span className="text-xs text-white/20 flex-shrink-0">{e.ts?.slice(11, 19)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
}

function SmokeRow({ label, screen }) {
  const [result, setResult] = useState(null); // null | 'pass' | 'fail'
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/10">
      <div className="flex gap-1">
        <button
          onClick={() => setResult('pass')}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${result === 'pass' ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 text-white/20 hover:border-green-400'}`}
        >✓</button>
        <button
          onClick={() => setResult('fail')}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${result === 'fail' ? 'bg-red-500 border-red-500 text-white' : 'border-white/20 text-white/20 hover:border-red-400'}`}
        >✗</button>
      </div>
      <p className="text-white/80 text-sm flex-1">{label}</p>
    </div>
  );
}