import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TermsPage } from "./pages/TermsPage";
import { api, handleAuthSuccess } from "./lib/api";
import { getStoredLanguage, getStoredToken, setStoredLanguage, setStoredToken } from "./lib/storage";
import { connectWallet, MetaMaskMissingError } from "./lib/wallet";

const emptyOverview = {
  totalBudget: 0,
  totalAllocated: 0,
  totalUtilized: 0,
  remainingFunds: 0,
  alertCount: 0,
  projects: [],
  transactions: [],
  announcements: [],
};

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function PublicOnlyRoute({ isAuthenticated, children }) {
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const [token, setToken] = useState(getStoredToken());
  const [language, setLanguageState] = useState(getStoredLanguage());
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState({ adminExists: true });
  const [referenceData, setReferenceData] = useState({ districts: [], cities: [], states: ["Bihar"] });
  const [overview, setOverview] = useState(emptyOverview);
  const [analytics, setAnalytics] = useState({ utilizationByDistrict: [], alerts: [] });
  const [users, setUsers] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [needsProfileUser, setNeedsProfileUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  function setLanguage(nextLanguage) {
    setLanguageState(nextLanguage);
    setStoredLanguage(nextLanguage);
  }

  async function loadAuthStatus() {
    const status = await api.getAuthStatus();
    setAuthStatus(status);
  }

  async function loadReferenceData() {
    if (!token) {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/reference-data`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      setReferenceData(data);
      return;
    }

    const data = await api.getReferenceData();
    setReferenceData(data);
  }

  async function loadSession() {
    if (!token) {
      setUser(null);
      return;
    }

    const me = await api.me();
    setUser(me.user);
  }

  async function loadDashboard() {
    if (!token) return;
    const [overviewData, analyticsData] = await Promise.all([api.getOverview(), api.getAnalytics()]);
    setOverview(overviewData);
    setAnalytics(analyticsData);
    if (["ADMIN", "DISTRICT", "DEPARTMENT"].includes(user?.role)) {
      const [usersData, submissionsData] = await Promise.all([api.getUsers(), api.getPendingSubmissions()]);
      setUsers(usersData.users);
      setPendingSubmissions(submissionsData.submissions || []);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await Promise.all([
          loadAuthStatus().catch(() => {}),
          loadReferenceData().catch(() => {}),
        ]);
        
        if (token) {
          await loadSession();
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setOverview(emptyOverview);
      return;
    }
    // Only load if user isn't already set or if it's not the initial mount 
    // (initial mount is handled by the init function)
    if (!user && !isInitialLoading) {
      loadSession().catch((err) => {
        setStoredToken("");
        setToken("");
        setError(err.message);
      });
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadDashboard().catch((err) => setError(err.message));
    }
  }, [user]);

  async function runAction(action) {
    setIsLoading(true);
    try {
      const result = await action();
      setError("");
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetupAdmin(payload) {
    const data = await runAction(() => api.setupAdmin(payload));
    handleAuthSuccess(data);
    setToken(data.token);
    await loadAuthStatus();
  }

  async function handleRegister(payload) {
    await runAction(() => api.register(payload));
  }

  async function handleVerifyOtp(payload) {
    const data = await runAction(() => api.verifyEmailOtp(payload));
    handleAuthSuccess(data);
    setToken(data.token);
  }

  async function handleLogin(payload) {
    const data = await runAction(() => api.login(payload));
    handleAuthSuccess(data);
    setToken(data.token);
  }

  async function handleGoogleLogin(payload) {
    const data = await runAction(() => api.googleLogin(payload));
    handleAuthSuccess(data);
    if (data.needsProfile) {
      // New Google user — store token but show profile completion form
      setNeedsProfileUser(data.user);
      setToken(data.token); // token is stored so updateProfile works (requires auth)
    } else {
      setToken(data.token);
    }
  }

  async function handleUpdateProfile(payload) {
    const data = await runAction(() => api.updateProfile(payload));
    setUser(data.user);
    setNeedsProfileUser(null);
    return data;
  }

  async function handleForgotPassword(payload) {
    return runAction(() => api.forgotPassword(payload));
  }

  async function handleResetPassword(payload) {
    return runAction(() => api.resetPassword(payload));
  }

  async function handleValidateResetOtp(payload) {
    return runAction(() => api.validateResetOtp(payload));
  }

  async function handleConnectWallet() {
    try {
      // If user already has a wallet bound in DB, just show that and return
      if (user?.walletAddress && user.walletAddress !== "") {
        setWalletAddress(user.walletAddress);
        return;
      }

      const address = await connectWallet();
      setWalletAddress(address);
      setError("");
      
      if (token) {
        // One-time binding logic: backend will reject if already bound
        const data = await runAction(() => api.updateWallet({ walletAddress: address }));
        setUser(data.user);
      }
    } catch (err) {
      if (err instanceof MetaMaskMissingError) {
        // Show a friendly install-MetaMask modal instead of the generic error toast
        setShowMetaMaskModal(true);
      } else {
        setError(err.message);
      }
    }
  }

  function handleLogout() {
    setStoredToken("");
    setToken("");
    setUser(null);
    setUsers([]);
  }

  async function handleAdminAction(action) {
    await runAction(action);
    await loadDashboard();
  }

  return (
    <>
      {/* MetaMask install modal */}
      {showMetaMaskModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
              🦊
            </div>
            <h2 className="text-xl font-bold text-slate-900">MetaMask Not Installed</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              MetaMask is a browser wallet extension required to connect your Ethereum wallet. Install it from the
              official website, then come back and try again.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-full bg-[#f7941e] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Install MetaMask →
              </a>
              <button
                type="button"
                onClick={() => setShowMetaMaskModal(false)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-lg lg:left-auto lg:right-6 lg:w-[420px]">
          {error}
          <button type="button" onClick={() => setError("")} className="ml-3 font-semibold underline">
            Dismiss
          </button>
        </div>
      ) : null}

      {isInitialLoading ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0d4f6c] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-slate-600">Loading Bihar Fund Tracker...</p>
        </div>
      ) : null}

      <Routes>
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute isAuthenticated={Boolean(token && user)}>
              <AuthPage
                language={language}
                onRegister={handleRegister}
                onVerifyOtp={handleVerifyOtp}
                onResendOtp={(payload) => runAction(() => api.resendOtp(payload))}
                onLogin={handleLogin}
                onForgotPassword={handleForgotPassword}
                onResetPassword={handleResetPassword}
                onValidateResetOtp={handleValidateResetOtp}
                onSetupAdmin={handleSetupAdmin}
                onGoogleLogin={handleGoogleLogin}
                onUpdateProfile={handleUpdateProfile}
                onConnectWallet={handleConnectWallet}
                referenceData={referenceData}
                authStatus={authStatus}
                isLoading={isLoading}
                walletAddress={walletAddress}
                needsProfileUser={needsProfileUser}
              />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={Boolean(token && user)}>
              <DashboardPage
                language={language}
                setLanguage={setLanguage}
                user={user}
                overview={overview}
                analytics={analytics}
                users={users}
                isLoading={isLoading}
                pendingSubmissions={pendingSubmissions}
                referenceData={referenceData}
                walletAddress={user?.walletAddress || walletAddress || ""}
                onLogout={handleLogout}
                onConnectWallet={handleConnectWallet}
                onUpdateProfile={handleUpdateProfile}
                onCreateProject={(payload) => handleAdminAction(() => api.createProject(payload))}
                onAllocateFunds={(projectId, payload) => handleAdminAction(() => api.allocateFunds(projectId, payload))}
                onTransferFunds={(projectId, payload) => handleAdminAction(() => api.transferFunds(projectId, payload))}
                onCreateAnnouncement={(payload) => handleAdminAction(() => api.createAnnouncement(payload))}
                onCreateUser={(payload) => handleAdminAction(() => api.createUser(payload))}
                onGetProject={(id) => api.getProjectById(id)}
                onSubmitWork={(projectId, formData) => handleAdminAction(() => api.submitWork(projectId, formData))}
                onApproveWork={(subId, payload) => handleAdminAction(() => api.approveSubmission(subId, payload))}
                onRejectWork={(subId, payload) => handleAdminAction(() => api.rejectSubmission(subId, payload))}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to={token && user ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </>
  );
}
