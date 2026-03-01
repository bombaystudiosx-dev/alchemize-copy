import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ClipboardCopy, Trash2, Download } from 'lucide-react';
import { getEvents, clearEvents, copyReport } from '@/components/common/appLogger';
import useBackNav from '@/components/common/useBackNav';
import CosmicBackground from '@/components/cosmic/CosmicBackground';


import ShipScore from '@/components/diagnostics/ShipScore';
import RouteInventory from '@/components/diagnostics/RouteInventory';
import AutomatedChecks from '@/components/diagnostics/AutomatedChecks';
import SmokeChecklist from '@/components/diagnostics/SmokeChecklist';

export default function Diagnostics() {
  const goBack = useBackNav('Settings', 'Diagnostics');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  const [autoChecks, setAutoChecks] = useState({});
  const [smokeResults, setSmokeResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qa_smoke_results') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    setLogs(getEvents());
    base44.auth.me().then(u => {
      setUser(u);
      setIsAdmin(u?.role === 'admin');
    }).catch(() => {});
  }, []);



  const handleSmokeToggle = (key, val) => {
    const next = { ...smokeResults, [key]: smokeResults[key] === val ? null : val };
    setSmokeResults(next);
    localStorage.setItem('qa_smoke_results', JSON.stringify(next));
  };

  const handleCopy = () => {
    copyReport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      user: user?.email,
      automated_checks: autoChecks,
      smoke_results: smokeResults,
      event_log: getEvents().slice(0, 50),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
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
          <h1 className="text-lg font-bold text-white flex-1 text-center mr-6">QA Dashboard</h1>
          <button onClick={handleExport} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Download className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="px-4 space-y-5">
          {!isAdmin && user && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-4">
              <p className="text-red-300 text-sm text-center">Admin access required.</p>
            </div>
          )}

          {/* Ship Score */}
          <ShipScore checks={autoChecks} smokeResults={smokeResults} />

          {/* Automated Checks */}
          <AutomatedChecks onResults={setAutoChecks} />

          {/* Smoke Tests */}
          <SmokeChecklist results={smokeResults} onToggle={handleSmokeToggle} />

          {/* Route Inventory */}
          <RouteInventory />

          {/* Event Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Event Log ({logs.length})</h2>
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
                    {e.latency && <span className="text-[10px] text-white/20">{e.latency}ms</span>}
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