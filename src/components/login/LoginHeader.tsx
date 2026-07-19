import { Shield } from 'lucide-react';

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-3">
        <Shield className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Stadium Guardian AI</h1>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        Smart Operations Assistant & Risk Mitigation Suite for Tournament Spectator Safety
      </p>
    </div>
  );
}
