import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Server, ExternalLink, Copy, Check } from 'lucide-react';

interface DbStatusResponse {
  connected: boolean;
  mode: string;
  driver: string;
  cluster: string;
  appName: string;
  username: string;
  hasPasswordConfigured: boolean;
  connectionStringTemplate: string;
  message: string;
  lastError?: string | null;
}

export const MongoAtlasStatusCard: React.FC = () => {
  const [status, setStatus] = useState<DbStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch DB status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Re-check periodically every 15 seconds
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const res = await fetch('/api/db/reconnect', { method: 'POST' });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to reconnect:', err);
    } finally {
      setReconnecting(false);
    }
  };

  const handleCopyIpRule = () => {
    navigator.clipboard.writeText('0.0.0.0/0');
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs transition-colors space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${
            status?.connected 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                MongoDB Atlas Cloud Database
              </h3>
              {loading ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Checking...
                </span>
              ) : status?.connected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Connected & Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Network Access Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Cluster: <code className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{status?.cluster || 'cluster0.mepvotl.mongodb.net'}</code> &bull; User: <code className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{status?.username || 'memunatuabukari20616_db_user'}</code>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleReconnect}
          disabled={reconnecting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#05286f] hover:bg-[#041d54] text-white transition cursor-pointer shadow-xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reconnecting ? 'animate-spin' : ''}`} />
          {reconnecting ? 'Connecting to Atlas...' : 'Test & Connect Now'}
        </button>
      </div>

      {/* Status Detail Banner */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
        status?.connected
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
          : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
      }`}>
        <div className="flex items-start gap-3">
          {status?.connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1.5 flex-1">
            <p className="font-semibold text-sm">
              {status?.connected
                ? 'MongoDB Atlas Cluster is Live & Actively Connected'
                : 'Credentials Stored & Ready — Awaiting Atlas Network Firewall Access'}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              {status?.message}
            </p>
          </div>
        </div>
      </div>

      {/* Network Access Step-by-Step (shown if not connected) */}
      {!status?.connected && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#4ea836]" />
              Quick Atlas Activation (30 Seconds)
            </span>
            <a
              href="https://cloud.mongodb.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#05286f] dark:text-sky-400 hover:underline"
            >
              Open MongoDB Atlas
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            MongoDB Atlas defaults to blocking incoming traffic from cloud servers until you enable network access for the cluster.
          </p>

          <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
            <li>
              In MongoDB Atlas left sidebar, click <strong className="text-slate-900 dark:text-white">Network Access</strong> (under Security).
            </li>
            <li>
              Click the green <strong className="text-emerald-700 dark:text-emerald-400">+ Add IP Address</strong> button.
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span>Click <strong className="text-slate-900 dark:text-white">ALLOW ACCESS FROM ANYWHERE</strong> (or enter:</span>
              <button
                type="button"
                onClick={handleCopyIpRule}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                title="Click to copy IP"
              >
                0.0.0.0/0
                {copiedRule ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
              </button>
              <span>) and click <strong className="text-slate-900 dark:text-white">Confirm</strong>.</span>
            </li>
            <li>
              Wait 15 seconds for Atlas to apply the rule, then click <strong className="text-[#05286f] dark:text-sky-400">Test & Connect Now</strong> above!
            </li>
          </ol>
        </div>
      )}

      {/* Connection Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1 mb-1">
            <Server className="w-3.5 h-3.5" /> Storage Mode
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {status?.mode === 'mongodb_atlas' ? 'MongoDB Atlas (Primary)' : 'Embedded Local Store (Fail-Safe)'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1 mb-1">
            <Database className="w-3.5 h-3.5" /> Database Target
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            startsmart_lms
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Authentication
          </div>
          <div className="font-bold text-slate-800 dark:text-slate-200 font-mono text-emerald-600 dark:text-emerald-400">
            SCRAM-SHA-1 / TLS 1.3
          </div>
        </div>
      </div>
    </section>
  );
};
