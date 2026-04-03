import { useState } from 'react';
import { ArrowLeft, Camera, Globe, Clock, ChevronDown, AlertCircle, CheckCircle2, Shield, Lock, X, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TABS = ['Withdrawal', 'Transactions', 'Trades', 'My account', 'Market', 'Tournaments', 'Analytics'];

export default function AccountPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My account');
  const [nickname, setNickname] = useState('#85396662');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [email] = useState('user@arcanine.com');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [twoStepEnabled] = useState(true);
  const [enterPlatform, setEnterPlatform] = useState(true);
  const [withdrawFunds, setWithdrawFunds] = useState(true);
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('(UTC+05:30)');

  const balance = parseFloat(localStorage.getItem('demo_balance') || '10000');

  const handleTabClick = (tab: string) => {
    if (tab === 'Withdrawal') navigate('/withdrawal');
    else setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#1A1D29] text-[#E0E2E7] font-['Montserrat',sans-serif]">
      {/* Top tabs bar */}
      <div className="flex items-center justify-between border-b border-[#2B3040] bg-[#1C1E2D] px-6">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/trade')} className="p-2 text-[#6B7280] hover:text-[#E0E2E7] mr-2">
            <ArrowLeft size={18} />
          </button>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-[#6B7280] hover:text-[#A0A5B5]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="accountTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0EB85B]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#6B7280]">My current currency</span>
            <span className="font-bold text-white flex items-center gap-1">
              $ USD
              <span className="bg-[#0EB85B] text-white text-[9px] font-bold px-2 py-0.5 rounded ml-1">CHANGE</span>
            </span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#6B7280]">Available for withdrawal</div>
            <div className="font-bold text-white">{balance > 0 ? `${balance.toFixed(2)}$` : '0.00$'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#6B7280]">In the account</div>
            <div className="font-bold text-white">{balance.toFixed(2)}$</div>
          </div>
        </div>
      </div>

      {/* Main content - scrollable */}
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 49px)' }}>
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_280px] gap-8">

            {/* Column 1: Personal data */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-[#E0E2E7] mb-4">Personal data:</h3>

              {/* User info card */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#2B3040] flex items-center justify-center">
                    <span className="text-lg font-bold text-[#6B7280]">A</span>
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3A4255] rounded-full flex items-center justify-center hover:bg-[#4A5265]">
                    <Camera size={10} className="text-[#A0A5B5]" />
                  </button>
                </div>
                <div>
                  <div className="text-sm font-medium">{email}</div>
                  <div className="text-xs text-[#6B7280]">ID: 85396662</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <X size={8} /> Not verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <FloatingInput label="Nickname" value={nickname} onChange={setNickname} />
                <FloatingInput label="First Name" value={firstName} onChange={setFirstName} placeholder="Empty" />
                <FloatingInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Empty" />
                <FloatingInput label="Date of birth" value={dob} onChange={setDob} placeholder="mm/dd/yyyy" />
                <FloatingInput label="Aadhaar" value={aadhaar} onChange={setAadhaar} placeholder="Empty" />

                <div className="relative">
                  <div className="border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2">
                    <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">Email</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{email}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-orange-400">Unverified</span>
                        <button className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded hover:bg-red-600">RESEND</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2">
                    <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">Country</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{country}</span>
                      <ChevronDown size={14} className="text-[#6B7280]" />
                    </div>
                  </div>
                </div>

                <FloatingInput label="Address" value={address} onChange={setAddress} placeholder="Empty" />

                <button className="w-full bg-[#2962FF] hover:bg-[#2962FF]/90 text-white font-bold py-3 rounded-lg transition-colors text-sm">
                  Save
                </button>
              </div>
            </motion.div>

            {/* Column 2: Documents verification */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <h3 className="text-sm font-semibold text-[#E0E2E7] mb-4">Documents verification:</h3>
              <div className="bg-[#2B3040] border border-[#3A4255] rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-red-400" />
                </div>
                <p className="text-sm text-[#A0A5B5] leading-relaxed">
                  You need fill identity information before verification your account.
                </p>
              </div>
            </motion.div>

            {/* Column 3: Security */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold text-[#E0E2E7] mb-4">Security:</h3>
              <div className="space-y-5">
                {/* Two-step verification */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-[#0EB85B] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Two-step verification</div>
                    <div className="text-xs text-[#6B7280] flex items-center gap-1">
                      Receiving codes via Email <Pencil size={10} className="text-[#2962FF] cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Toggle: To enter the platform */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch enabled={enterPlatform} onChange={setEnterPlatform} />
                    <span className="text-sm">To enter the platform</span>
                  </div>
                </div>

                {/* Toggle: To withdraw funds */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch enabled={withdrawFunds} onChange={setWithdrawFunds} />
                    <span className="text-sm">To withdraw funds</span>
                  </div>
                </div>

                {/* Password */}
                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-[#2B3040]">
                  <Lock size={18} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">Password</div>
                    <div className="text-xs text-[#6B7280]">Change your account password</div>
                    <button className="text-xs text-[#0EB85B] hover:underline mt-1">Change</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Column 4: Language/Timezone + Delete */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2">
                  <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">Language</label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-[#6B7280]" />
                      <span className="text-sm">{language}</span>
                    </div>
                    <ChevronDown size={14} className="text-[#6B7280]" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2">
                  <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">Timezone</label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#6B7280]" />
                      <span className="text-sm">{timezone}</span>
                    </div>
                    <ChevronDown size={14} className="text-[#6B7280]" />
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm mt-4 transition-colors">
                <X size={14} />
                Delete My account
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Floating label input */
function FloatingInput({
  label,
  value,
  onChange,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <div className="border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2">
        <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">{label}</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#E0E2E7] outline-none placeholder:text-[#4A5265]"
        />
      </div>
    </div>
  );
}

/* Toggle switch */
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-10 h-5 rounded-full relative transition-colors ${
        enabled ? 'bg-[#2962FF]' : 'bg-[#3A4255]'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
