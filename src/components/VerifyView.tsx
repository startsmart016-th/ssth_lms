import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft, Building, Calendar, Hash, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface VerifyViewProps {
  userId: string;
  onClose?: () => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({ userId, onClose }) => {
  const { settings } = useSettings();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkVerification() {
      setLoading(true);
      try {
        const res = await fetch(`/api/verify-id/${userId}`);
        const json = await res.json();
        if (res.ok && json.verified) {
          setData(json);
        } else {
          setError(json.message || 'Credential verification record could not be validated.');
        }
      } catch (e: any) {
        setError(e.message || 'Verification service offline.');
      } finally {
        setLoading(false);
      }
    }
    checkVerification();
  }, [userId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Glowing aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Validating Cryptographic Credential...</p>
            <p className="text-xs text-slate-500">Checking StartSmart Central Ledger</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Credential Not Verified</h3>
              <p className="text-xs text-rose-300 mt-1 max-w-xs mx-auto">{error}</p>
            </div>
            <p className="text-[11px] text-slate-400">
              The scanned ID number or token is not active in the {settings.name} registry.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Institution Brand */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <img
                src={settings.logoUrl || 'https://i.imgur.com/x45FW8G.png'}
                alt="Logo"
                crossOrigin="anonymous"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
                className="w-10 h-10 object-contain rounded-xl bg-slate-800 p-1 border border-slate-700"
              />
              <div>
                <h4 className="text-sm font-extrabold text-white uppercase font-['Outfit']">
                  {settings.name}
                </h4>
                <p className="text-xs text-sky-400 font-medium">Official Registry Verification</p>
              </div>
            </div>

            {/* Validation Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase block">
                  Registry Status
                </span>
                <p className="text-sm font-extrabold text-white">AUTHENTIC & VERIFIED</p>
                <p className="text-[10px] text-slate-300">Bearer identity active in official student/staff directory.</p>
              </div>
            </div>

            {/* Holder Profile */}
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
              <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-sky-400/40 bg-slate-800 shrink-0">
                <img
                  src={data.holder.avatarUrl}
                  alt={data.holder.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {data.holder.role}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white truncate font-['Outfit']">
                  {data.holder.name}
                </h3>
                <p className="text-xs text-slate-300 truncate">{data.holder.department}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">ID:</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{data.holder.idNumber}</span>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">ISSUED ON</span>
                <span className="font-semibold text-slate-200">{data.holder.issueDate}</span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">EXPIRATION</span>
                <span className="font-semibold text-emerald-400">{data.holder.expiryDate}</span>
              </div>
            </div>

            {/* Endorsement Seals */}
            <div className="flex items-center justify-between bg-slate-800/30 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img
                    src={data.institution.sealOrStampUrl || settings.sealOrStampUrl}
                    alt="Institutional Stamp"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-sky-400 block uppercase">Official Stamp</span>
                  <span className="text-[11px] text-slate-300">Signed by Registrar</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block">INSTITUTION</span>
                <span className="text-xs font-semibold text-white truncate">{settings.name}</span>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[9px] font-mono text-slate-400 break-all">
              <span className="text-sky-400 block font-bold mb-0.5">DIGITAL SIGNATURE PROOF:</span>
              {data.securityProof}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
