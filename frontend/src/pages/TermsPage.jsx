import React from "react";
import { ShieldAlert, ArrowLeft, Info, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-[32px] overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d2b3e] to-[#0d4f6c] p-8 text-white relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-6 p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            <p className="mt-2 text-slate-300">Disclaimer & Project Information</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* CRITICAL DISCLAIMER */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900 uppercase tracking-tight">Important: Not an Official Website</h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-800 font-medium">
                  This website is **NOT** an official platform of the Government of Bihar or any of its departments. 
                  It is a **personal/educational project** created for demonstration purposes only.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Project Purpose */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Info className="text-[#0d4f6c]" size={20} />
              <h3 className="text-xl font-bold text-slate-800">1. Project Purpose</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              The "Bihar Fund Tracker" is a blockchain-based simulation designed to showcase how fund flow transparency can be improved. All departments, projects, and transactions shown here are part of a technical demo and do not represent real-world data or official government allocations.
            </p>
          </section>

          {/* Section: Blockchain & Transactions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="text-[#0d4f6c]" size={20} />
              <h3 className="text-xl font-bold text-slate-800">2. Blockchain & Money</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Any cryptocurrency or tokens used within this platform are for **Testnet** purposes only (e.g., Sepolia/Amoy). No real money is required or used. Users are advised never to send real Ether (ETH) or any other valuable asset to addresses generated or displayed on this site.
            </p>
          </section>

          {/* Section: Data & Privacy */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-[#0d4f6c]" size={20} />
              <h3 className="text-xl font-bold text-slate-800">3. Data Usage</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              While we use standard security practices (JWT, password hashing), please do not use your real official passwords or sensitive personal information. This is a demo environment, and data may be wiped periodically during maintenance.
            </p>
          </section>

          {/* Section: Liability */}
          <section className="pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">4. Limitation of Liability</h3>
            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wide">
              The developer of this platform is not responsible for any misunderstanding, misinformation, or misuse of this application. By using this platform, you acknowledge that you understand its status as a non-official, educational simulation.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-500">
            Developed by Rishu Raj as a Portfolio Project
          </p>
          <button 
            onClick={() => navigate("/auth")}
            className="mt-4 text-[#0d4f6c] font-bold text-sm hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
