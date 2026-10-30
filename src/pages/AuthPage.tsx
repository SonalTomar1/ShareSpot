import React, { useState } from 'react';
import { User, UserGroup } from '../types';
import { useApp } from '../context/AppContext';
import { Check, ShieldAlert, ArrowRight, UserCheck, Lock, Mail, IdCard, Building } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { loginWithCredentials, loginAsUser, signUpUser, allUsers } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign-up form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [userGroup, setUserGroup] = useState<UserGroup>('Student');
  const [hostelBlock, setHostelBlock] = useState('Block A');
  const [collegeIdNumber, setCollegeIdNumber] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your college email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithCredentials(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setLoginError(result.error || 'Email or password is incorrect.');
    }
  };

  // Handle new account registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!fullName.trim()) {
      setSignupError('Please provide your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid college email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (!collegeIdNumber.trim()) {
      setSignupError('Please provide your college ID number.');
      return;
    }
    if (!agreedToRules) {
      setSignupError('You must agree to campus sharing and equipment care rules.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUpUser({
      name: fullName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      group: userGroup,
      hostelBlock: userGroup === 'Hosteler' ? hostelBlock : undefined,
      collegeIdNumber: collegeIdNumber.trim(),
    });
    setIsSubmitting(false);

    if (!result.success) {
      setSignupError(result.error || 'Could not create account. Please try again.');
    }
  };

  // 6 specific demo accounts for judges
  const demoAccounts = [
    {
      id: 'user_aarav',
      label: 'Aarav (Student)',
      desc: 'Seeker & Owner • CS Dept',
    },
    {
      id: 'user_meera',
      label: 'Meera (Hosteler, Block A)',
      desc: 'Seeker • Block A Resident',
    },
    {
      id: 'user_sharma',
      label: 'Dr. Sharma (Teacher)',
      desc: 'Owner • Engineering Faculty',
    },
    {
      id: 'user_kapoor',
      label: 'Ms. Kapoor (Counsellor)',
      desc: 'Owner • Staff Counselor',
    },
    {
      id: 'user_warden',
      label: 'Warden Singh (Manager)',
      desc: 'Manager • Hostel Block A',
    },
    {
      id: 'user_admin',
      label: 'Campus Admin (Admin)',
      desc: 'Admin • Campus Services',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2933] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold text-[#1F2933] tracking-tight">
            ShareSpot
          </h1>
          <p className="mt-1 text-sm text-[#52606D]">
            {mode === 'login'
              ? 'Sign in with your college email'
              : 'Create your campus sharing account'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Card */}
        <div className="bg-white py-6 px-5 sm:px-8 border border-[#E5E0D8] rounded-md space-y-5">
          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-[#B42318]/30 rounded text-xs text-[#B42318] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  College email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-[#1F2933]">
                    Password
                  </label>
                  <span className="text-[11px] text-[#829AB1]">
                    Demo pass: password123
                  </span>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold py-2 px-4 rounded transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center pt-2 border-t border-[#E5E0D8]">
                <p className="text-xs text-[#52606D]">
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setLoginError('');
                    }}
                    className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* SIGN-UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              {signupError && (
                <div className="p-3 bg-red-50 border border-[#B42318]/30 rounded text-xs text-[#B42318] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Verma"
                  className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  College email
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="rohan.v@campus.edu"
                  className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  Campus group
                </label>
                <select
                  value={userGroup}
                  onChange={(e) => setUserGroup(e.target.value as UserGroup)}
                  className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded bg-white focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher/Staff">Teacher / Staff</option>
                  <option value="Hosteler">Hosteler</option>
                </select>
              </div>

              {/* Hostel block shown only if Hosteler */}
              {userGroup === 'Hosteler' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                    Hostel block
                  </label>
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded bg-white focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  College ID number
                </label>
                <input
                  type="text"
                  value={collegeIdNumber}
                  onChange={(e) => setCollegeIdNumber(e.target.value)}
                  placeholder="e.g. STU-2024-9182"
                  className="w-full px-3 py-1.5 text-sm border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0F766E] text-[#1F2933]"
                />
                <p className="text-[11px] text-[#829AB1] mt-1">
                  New accounts require ID verification by campus administration.
                </p>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeRules"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-0.5 rounded border-[#CBD5E1] text-[#0F766E] focus:ring-0"
                />
                <label htmlFor="agreeRules" className="text-xs text-[#52606D] leading-tight cursor-pointer">
                  I agree to return equipment on time, record truthful photo condition, and respect campus community guidelines.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold py-2 px-4 rounded transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-center pt-2 border-t border-[#E5E0D8]">
                <p className="text-xs text-[#52606D]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setSignupError('');
                    }}
                    className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* JUDGES DEMO ACCESS SECTION */}
        <div className="mt-6 bg-white p-5 border border-[#E5E0D8] rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1F2933]">
                Judges: use a demo account
              </h3>
              <p className="text-[11px] text-[#52606D] mt-0.5">
                Click any role to log in instantly and evaluate permissions:
              </p>
            </div>
            <span className="text-[10px] bg-[#FAF7F2] border border-[#E5E0D8] text-[#0F766E] font-semibold px-2 py-0.5 rounded">
              One-click
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {demoAccounts.map((account) => {
              const matchedUser = allUsers.find((u) => u.id === account.id);
              if (!matchedUser) return null;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => loginAsUser(matchedUser)}
                  className="flex items-center gap-2.5 p-2 rounded border border-[#E5E0D8] hover:border-[#0F766E] hover:bg-[#FAF7F2] transition-colors text-left cursor-pointer group"
                >
                  <img
                    src={matchedUser.avatar}
                    alt={matchedUser.name}
                    className="w-8 h-8 rounded object-cover border border-[#E5E0D8] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#1F2933] group-hover:text-[#0F766E] truncate">
                      {account.label}
                    </p>
                    <p className="text-[10px] text-[#627D98] truncate">
                      {account.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#829AB1] pt-1 text-center">
            Demo authentication. Passwords stored as SHA-256 hashes.
          </p>
        </div>
      </div>
    </div>
  );
};
