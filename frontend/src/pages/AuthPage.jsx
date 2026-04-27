import { useMemo, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ProfileCompletion } from "../components/ProfileCompletion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { t } from "../lib/i18n";

/* ─── tiny helpers ─────────────────────────────────────── */
const initialRegister = {
  firstName: "",
  lastName: "",
  mobileNumber: "",
  email: "",
  district: "",
  state: "Bihar",
  password: "",
  confirmPassword: "",
};

const initialAdmin = {
  departmentName: "",
  email: "",
  district: "",
  state: "Bihar",
  password: "",
  confirmPassword: "",
};

const initialLogin = { email: "", password: "" };
const initialOtp   = { email: "", otp: "" };
const initialForgot = { email: "", otp: "", password: "", confirmPassword: "" };

/* ─── shared field components ───────────────────────────── */
function Field({ label, icon: Icon, type = "text", value, onChange, placeholder, suffix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-800 outline-none transition focus:border-[#0d4f6c] focus:bg-white focus:ring-2 focus:ring-[#0d4f6c]/10 ${Icon ? "pl-10" : "pl-4"} ${suffix ? "pr-10" : "pr-4"}`}
        />
        {suffix && <span className="absolute right-3">{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, icon: Icon, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
            <Icon size={15} />
          </span>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-800 outline-none appearance-none transition focus:border-[#0d4f6c] focus:bg-white focus:ring-2 focus:ring-[#0d4f6c]/10 ${Icon ? "pl-10" : "pl-4"} pr-4`}
        >
          {children}
        </select>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      icon={Lock}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "••••••••"}
      suffix={
        <button type="button" onClick={() => setShow((s) => !s)} className="text-slate-400 hover:text-slate-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}

function Alert({ type, message }) {
  const styles = {
    error:   "bg-rose-50   border-rose-200   text-rose-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    "bg-blue-50    border-blue-200    text-blue-700",
  };
  const icons = {
    error:   <XCircle size={15} className="flex-shrink-0" />,
    success: <CheckCircle2 size={15} className="flex-shrink-0" />,
    info:    <ShieldCheck size={15} className="flex-shrink-0" />,
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}

function PrimaryButton({ children, type = "submit", onClick, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-[#0d4f6c] py-3 text-sm font-semibold text-white transition hover:bg-[#0a3f57] active:scale-[0.98] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function Divider({ label = "OR" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* ─── RIGHT PANEL ──────────────────────────────────────── */
function RightPanel({ language }) {
  return (
    <div className="hidden lg:flex flex-col justify-between rounded-r-[32px] bg-gradient-to-br from-[#0d2b3e] via-[#0d4f6c] to-[#172033] p-10 text-white">
      {/* Logo pill */}
      <div className="inline-flex w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#ffd59a]">
        {t(language, "appName")}
      </div>

      {/* Hero image */}
      <div className="my-6 flex-1 flex items-center justify-center">
        <img
          src="/hero.png"
          alt="Bihar Fund Tracker"
          className="max-h-[340px] w-full object-contain drop-shadow-[0_20px_60px_rgba(255,213,154,0.15)] rounded-2xl"
        />
      </div>

      {/* Tagline */}
      <div>
        <h2 className="text-3xl font-bold leading-tight">
          Transparent Fund Flow<br />
          <span className="text-[#ffd59a]">Across Bihar</span>
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-300 max-w-xs">
          Track every rupee from State → District → Department → Vendor with immutable blockchain records.
        </p>

        {/* Stat pills */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: "Districts Covered", value: "38" },
            { label: "Blockchain-backed", value: "100%" },
            { label: "Real-time Tracking", value: "Live" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
              <p className="text-lg font-bold text-[#ffd59a]">{s.value}</p>
              <p className="text-xs text-slate-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */
export function AuthPage({
  language,
  onRegister,
  onVerifyOtp,
  onResendOtp,
  onLogin,
  onForgotPassword,
  onResetPassword,
  onValidateResetOtp,
  onSetupAdmin,
  onGoogleLogin,
  onUpdateProfile,
  onConnectWallet,
  referenceData,
  authStatus,
  walletAddress,
  needsProfileUser,
}) {
  /* which view is active */
  const [view, setView] = useState(authStatus.adminExists ? "login" : "setup");

  /* form states */
  const [loginForm,    setLoginForm]    = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [adminForm,    setAdminForm]    = useState(initialAdmin);
  const [otpForm,      setOtpForm]      = useState(initialOtp);
  const [forgotForm,   setForgotForm]   = useState(initialForgot);

  /* forgot password step: "email" | "reset" */
  const [forgotStep, setForgotStep] = useState("email");

  /* OTP validation state for forgot-password inline check */
  const [otpValidation, setOtpValidation] = useState({ status: "idle", message: "" });

  /* feedback messages shown inside each panel */
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  function clearFeedback() { setFeedback({ type: "", message: "" }); }
  function setError(msg)   { setFeedback({ type: "error",   message: msg }); }
  function setSuccess(msg) { setFeedback({ type: "success", message: msg }); }

  /* ── LOGIN ─────────────────────────────────────────── */
  async function submitLogin(e) {
    e.preventDefault();
    clearFeedback();
    try {
      await onLogin({ ...loginForm, walletAddress });
    } catch (err) {
      setError(err.message);
    }
  }

  /* ── REGISTER ──────────────────────────────────────── */
  async function submitRegister(e) {
    e.preventDefault();
    clearFeedback();
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await onRegister(registerForm);
      setOtpForm({ email: registerForm.email, otp: "" });
      setView("verify");
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  }

  /* ── VERIFY OTP ────────────────────────────────────── */
  async function submitVerifyOtp(e) {
    e.preventDefault();
    clearFeedback();
    try {
      await onVerifyOtp(otpForm);
      // success → show message then auto-switch to login
      setSuccess("✅ Account created successfully! Redirecting to login…");
      setRegisterForm(initialRegister);
      setTimeout(() => {
        clearFeedback();
        setView("login");
      }, 2000);
    } catch (err) {
      setError("❌ " + (err.message || "Invalid OTP. Please enter the correct OTP."));
    }
  }

  /* ── SETUP ADMIN ───────────────────────────────────── */
  async function submitSetupAdmin(e) {
    e.preventDefault();
    clearFeedback();
    if (adminForm.password !== adminForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await onSetupAdmin({
        departmentName: adminForm.departmentName,
        email:          adminForm.email,
        district:       adminForm.district,
        state:          adminForm.state,
        password:       adminForm.password,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  /* ── FORGOT — send OTP ─────────────────────────────── */
  async function submitForgotEmail(e) {
    e.preventDefault();
    clearFeedback();
    try {
      await onForgotPassword({ email: forgotForm.email });
      setSuccess("OTP sent! Check your email.");
      setForgotStep("reset");
    } catch (err) {
      setError(err.message);
    }
  }

  /* ── FORGOT — validate OTP live ────────────────────── */
  async function checkResetOtp(nextOtp) {
    setForgotForm((c) => ({ ...c, otp: nextOtp }));
    if (nextOtp.length !== 6 || !forgotForm.email) {
      setOtpValidation({ status: "idle", message: "" });
      return;
    }
    try {
      const result = await onValidateResetOtp({ email: forgotForm.email, otp: nextOtp });
      setOtpValidation({ status: result.valid ? "valid" : "invalid", message: result.message });
    } catch {
      setOtpValidation({ status: "invalid", message: "Could not validate OTP." });
    }
  }

  /* ── FORGOT — reset password ───────────────────────── */
  async function submitForgotReset(e) {
    e.preventDefault();
    clearFeedback();
    if (forgotForm.password !== forgotForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (otpValidation.status !== "valid") {
      setError("Please enter a valid OTP first.");
      return;
    }
    try {
      await onResetPassword({ email: forgotForm.email, otp: forgotForm.otp, password: forgotForm.password });
      setSuccess("Password reset successful! Please login with your new password.");
      setForgotForm(initialForgot);
      setOtpValidation({ status: "idle", message: "" });
      setForgotStep("email");
      setTimeout(() => { clearFeedback(); setView("login"); }, 2200);
    } catch (err) {
      setError(err.message);
    }
  }

  /* Google button wrapper rendered by @react-oauth/google */
  const googleButton = import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
    <div className="w-full">
      <GoogleLogin
        onSuccess={(cr) => {
          clearFeedback();
          onGoogleLogin({ credential: cr.credential, walletAddress }).catch((err) => setError(err.message));
        }}
        onError={() => setError("Google sign-in failed. Please try again.")}
        width="100%"
        text="continue_with"
        shape="rectangular"
        theme="outline"
      />
    </div>
  ) : (
    <button type="button" disabled className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed">
      Continue with Google (not configured)
    </button>
  );

  /* active form panel */
  const formTitle = useMemo(() => {
    const map = {
      login:   "Welcome Back!",
      register:"Create Account",
      verify:  "Verify Your Email",
      forgot:  "Forgot Password",
      setup:   "Setup Admin Account",
    };
    return map[view] || "";
  }, [view]);

  const formSubtitle = useMemo(() => {
    const map = {
      login:   "Sign in to access your Bihar Fund Tracker dashboard.",
      register:"Fill in your details to create an account.",
      verify:  "Enter the 6-digit OTP sent to your email.",
      forgot:  forgotStep === "email" ? "Enter your email to receive a password reset OTP." : "Enter the OTP and set your new password.",
      setup:   "Government admin setup for the Bihar portal.",
    };
    return map[view] || "";
  }, [view, forgotStep]);

  // If Google login returned a new user needing profile, show profile completion form
  if (needsProfileUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] overflow-hidden grid lg:grid-cols-[1fr_1fr]">
          <div className="p-8 lg:p-10 flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-[#0d4f6c] flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-wide">Bihar Fund Tracker</span>
            </div>
            <ProfileCompletion
              user={needsProfileUser}
              referenceData={referenceData}
              onSave={onUpdateProfile}
            />
          </div>
          <RightPanel language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] overflow-hidden grid lg:grid-cols-[1fr_1fr]">

        {/* ─── LEFT: FORM PANEL ────────────────────────── */}
        <div className="p-8 lg:p-10 flex flex-col">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-[#0d4f6c] flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-wide">Bihar Fund Tracker</span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">{formTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{formSubtitle}</p>
          </div>

          {/* Feedback alert */}
          {feedback.message ? (
            <div className="mb-4">
              <Alert type={feedback.type} message={feedback.message} />
            </div>
          ) : null}

          {/* ── VIEW: LOGIN ── */}
          {view === "login" ? (
            <form className="flex flex-col gap-4" onSubmit={submitLogin}>
              <Field
                label="Email"
                icon={Mail}
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="Enter your email"
              />
              <PasswordField
                label="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => { setView("forgot"); setForgotStep("email"); clearFeedback(); }} className="text-xs font-semibold text-[#0d4f6c] hover:underline">
                  Forgot Password?
                </button>
              </div>
              <PrimaryButton>Sign In</PrimaryButton>
              <Divider />
              {googleButton}
              <p className="text-center text-sm text-slate-500 mt-2">
                Don't have an account?{" "}
                <button type="button" onClick={() => { setView("register"); clearFeedback(); }} className="font-semibold text-[#0d4f6c] hover:underline">
                  Sign Up
                </button>
              </p>
              {/* Wallet connect */}
              <button
                type="button"
                onClick={onConnectWallet}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                <Wallet size={15} />
                {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "Connect MetaMask Wallet"}
              </button>
            </form>
          ) : null}

          {/* ── VIEW: REGISTER ── */}
          {view === "register" ? (
            <form className="flex flex-col gap-3" onSubmit={submitRegister}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" icon={User}  value={registerForm.firstName}   onChange={(e) => setRegisterForm((c) => ({ ...c, firstName: e.target.value }))}   placeholder="Rahul" />
                <Field label="Last Name"  icon={User}  value={registerForm.lastName}    onChange={(e) => setRegisterForm((c) => ({ ...c, lastName: e.target.value }))}    placeholder="Kumar" />
              </div>
              <Field label="Email"         icon={Mail}   type="email" value={registerForm.email}      onChange={(e) => setRegisterForm((c) => ({ ...c, email: e.target.value }))}       placeholder="you@example.com" />
              <div className="grid grid-cols-1 gap-3">
                <SelectField label="District" icon={MapPin} value={registerForm.district} onChange={(e) => setRegisterForm((c) => ({ ...c, district: e.target.value }))}>
                  <option value="">Select District</option>
                  {referenceData.districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </SelectField>
              </div>
              <PasswordField label="Password"         value={registerForm.password}        onChange={(e) => setRegisterForm((c) => ({ ...c, password: e.target.value }))} />
              <PasswordField label="Confirm Password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
              <PrimaryButton>Create Account</PrimaryButton>
              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button type="button" onClick={() => { setView("login"); clearFeedback(); }} className="font-semibold text-[#0d4f6c] hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          ) : null}

          {/* ── VIEW: VERIFY OTP ── */}
          {view === "verify" ? (
            <form className="flex flex-col gap-4" onSubmit={submitVerifyOtp}>
              <Field label="Email" icon={Mail} type="email" value={otpForm.email} onChange={(e) => setOtpForm((c) => ({ ...c, email: e.target.value }))} placeholder="your@email.com" />
              <Field
                label="6-Digit OTP"
                icon={KeyRound}
                value={otpForm.otp}
                onChange={(e) => setOtpForm((c) => ({ ...c, otp: e.target.value }))}
                placeholder="Enter OTP from email"
              />
              <PrimaryButton>Verify & Activate Account</PrimaryButton>
              <button
                type="button"
                onClick={() => onResendOtp({ email: otpForm.email }).then(() => setSuccess("OTP resent!")).catch((err) => setError(err.message))}
                className="text-sm text-center text-[#0d4f6c] font-semibold hover:underline"
              >
                Resend OTP
              </button>
              <p className="text-center text-sm text-slate-500">
                <button type="button" onClick={() => { setView("login"); clearFeedback(); }} className="font-semibold text-[#0d4f6c] hover:underline">
                  ← Back to Login
                </button>
              </p>
            </form>
          ) : null}

          {/* ── VIEW: FORGOT PASSWORD ── */}
          {view === "forgot" ? (
            <div className="flex flex-col gap-4">
              {/* Step 1: email */}
              {forgotStep === "email" ? (
                <form className="flex flex-col gap-4" onSubmit={submitForgotEmail}>
                  <Field label="Registered Email" icon={Mail} type="email" value={forgotForm.email} onChange={(e) => setForgotForm((c) => ({ ...c, email: e.target.value }))} placeholder="you@example.com" />
                  <PrimaryButton>Send OTP to Email</PrimaryButton>
                  <p className="text-center text-sm text-slate-500">
                    <button type="button" onClick={() => { setView("login"); clearFeedback(); }} className="font-semibold text-[#0d4f6c] hover:underline">
                      ← Back to Login
                    </button>
                  </p>
                </form>
              ) : null}

              {/* Step 2: OTP + new password */}
              {forgotStep === "reset" ? (
                <form className="flex flex-col gap-4" onSubmit={submitForgotReset}>
                  <div>
                    <Field
                      label="OTP"
                      icon={KeyRound}
                      value={forgotForm.otp}
                      onChange={(e) => checkResetOtp(e.target.value)}
                      placeholder="6-digit OTP"
                    />
                    {otpValidation.status !== "idle" ? (
                      <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${otpValidation.status === "valid" ? "text-emerald-600" : "text-rose-600"}`}>
                        {otpValidation.status === "valid" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {otpValidation.message}
                      </div>
                    ) : null}
                  </div>
                  <PasswordField label="New Password"     value={forgotForm.password}        onChange={(e) => setForgotForm((c) => ({ ...c, password: e.target.value }))} />
                  <PasswordField label="Confirm Password" value={forgotForm.confirmPassword} onChange={(e) => setForgotForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
                  {forgotForm.password && forgotForm.confirmPassword ? (
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${forgotForm.password === forgotForm.confirmPassword ? "text-emerald-600" : "text-rose-600"}`}>
                      {forgotForm.password === forgotForm.confirmPassword ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {forgotForm.password === forgotForm.confirmPassword ? "Passwords match" : "Passwords do not match"}
                    </div>
                  ) : null}
                  <PrimaryButton>Reset Password</PrimaryButton>
                  <button type="button" onClick={() => setForgotStep("email")} className="text-sm text-center text-[#0d4f6c] font-semibold hover:underline">
                    ← Change Email / Resend OTP
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          {/* ── VIEW: SETUP ADMIN ── */}
          {view === "setup" ? (
            <form className="flex flex-col gap-3" onSubmit={submitSetupAdmin}>
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 font-medium">
                🏛️ Government Admin Registration — Use your official department email and district details.
              </div>
              <Field label="Department Name" icon={Building2} value={adminForm.departmentName} onChange={(e) => setAdminForm((c) => ({ ...c, departmentName: e.target.value }))} placeholder="e.g. Water Department" />
              <Field label="Official Email"  icon={Mail}      type="email" value={adminForm.email} onChange={(e) => setAdminForm((c) => ({ ...c, email: e.target.value }))} placeholder="dept@bihar.gov.in" />
              <SelectField label="District (Optional)" icon={MapPin} value={adminForm.district} onChange={(e) => setAdminForm((c) => ({ ...c, district: e.target.value }))}>
                <option value="">Select District</option>
                {referenceData.districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </SelectField>
              <PasswordField label="Password"         value={adminForm.password}        onChange={(e) => setAdminForm((c) => ({ ...c, password: e.target.value }))} />
              <PasswordField label="Confirm Password" value={adminForm.confirmPassword} onChange={(e) => setAdminForm((c) => ({ ...c, confirmPassword: e.target.value }))} />
              <PrimaryButton>Setup Admin Account</PrimaryButton>
            </form>
          ) : null}
          {/* Footer / Terms */}
          <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              © 2026 Personal Project
            </p>
            <a 
              href="/terms" 
              target="_blank" 
              className="text-[10px] text-[#0d4f6c] hover:underline font-bold uppercase tracking-widest"
            >
              Terms & Disclaimer
            </a>
          </div>
        </div>

        {/* ─── RIGHT: DECORATIVE PANEL ─────────────────── */}
        <RightPanel language={language} />
      </div>
    </div>
  );
}
