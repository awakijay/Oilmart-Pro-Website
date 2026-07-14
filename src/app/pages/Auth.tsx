import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Lock, Mail, Phone, User } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { createBotChallenge, isBotCheckValid } from '../utils/botProtection';

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login, register } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/profile';
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [botChallenge, setBotChallenge] = useState(() => createBotChallenge());
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginSecurity, setLoginSecurity] = useState({ securityAnswer: '', website: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    securityAnswer: '',
    website: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isBotCheckValid(loginSecurity.securityAnswer, botChallenge.answer, loginSecurity.website)) {
      setFeedback({ type: 'error', message: 'Security check failed. Please answer the question correctly.' });
      setBotChallenge(createBotChallenge());
      setLoginSecurity({ securityAnswer: '', website: '' });
      return;
    }
    const result = await login(loginForm.email, loginForm.password);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) navigate(redirectTo);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isBotCheckValid(registerForm.securityAnswer, botChallenge.answer, registerForm.website)) {
      setFeedback({ type: 'error', message: 'Security check failed. Please answer the question correctly.' });
      setBotChallenge(createBotChallenge());
      setRegisterForm((prev) => ({ ...prev, securityAnswer: '', website: '' }));
      return;
    }
    const { securityAnswer, website, ...payload } = registerForm;
    const result = await register(payload);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.2),_transparent_30%),linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_55%,_#ffffff_100%)] px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_460px]">
        <div className="rounded-[2rem] bg-gray-900 p-8 text-white shadow-2xl lg:p-12">
          <BrandLogo className="inline-flex rounded-2xl bg-white px-4 py-3" imageClassName="h-12" />
          <div className="mt-10 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">Customer Access</p>
            <h1 className="text-4xl font-bold leading-tight">Create your Oil Mart Pro account and manage everything in one place.</h1>
            <p className="mt-4 text-lg text-gray-300">
              Save your details, track orders, send requests faster, and keep your profile ready for quotes, leases, and procurement support.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              'Save your profile for faster checkout',
              'Access your account and order activity anytime',
              'Update your profile photo and business details',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                  <CheckCircle2 className="h-5 w-5 text-orange-300" />
                </div>
                <p className="text-sm text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-xl lg:p-10">
          <div className="mb-8 flex rounded-2xl bg-gray-100 p-1">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Create Account
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Sign In
            </button>
          </div>

          {feedback && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {feedback.message}
            </div>
          )}

          {mode === 'register' ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><User className="h-4 w-4 text-orange-500" />First Name</span>
                  <input required value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-900">Last Name</span>
                  <input required value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Mail className="h-4 w-4 text-orange-500" />Email Address</span>
                <input type="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Phone className="h-4 w-4 text-orange-500" />Phone Number</span>
                  <input required value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-900">Company</span>
                  <input required value={registerForm.company} onChange={(e) => setRegisterForm({ ...registerForm, company: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Lock className="h-4 w-4 text-orange-500" />Password</span>
                <input type="password" required value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <div className="hidden" aria-hidden="true">
                <input value={registerForm.website} onChange={(e) => setRegisterForm({ ...registerForm, website: e.target.value })} tabIndex={-1} autoComplete="off" className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3" />
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Security Question: {botChallenge.question}</span>
                <input value={registerForm.securityAnswer} onChange={(e) => setRegisterForm({ ...registerForm, securityAnswer: e.target.value })} required inputMode="numeric" className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <button type="submit" className="w-full rounded-2xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600">
                Create My Account
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Mail className="h-4 w-4 text-orange-500" />Email Address</span>
                <input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Lock className="h-4 w-4 text-orange-500" />Password</span>
                <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <div className="hidden" aria-hidden="true">
                <input value={loginSecurity.website} onChange={(e) => setLoginSecurity({ ...loginSecurity, website: e.target.value })} tabIndex={-1} autoComplete="off" className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3" />
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Security Question: {botChallenge.question}</span>
                <input value={loginSecurity.securityAnswer} onChange={(e) => setLoginSecurity({ ...loginSecurity, securityAnswer: e.target.value })} required inputMode="numeric" className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-orange-500 focus:outline-none" />
              </label>
              <button type="submit" className="w-full rounded-2xl bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-black">
                Sign In
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="font-semibold text-orange-500 hover:text-orange-600">Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
