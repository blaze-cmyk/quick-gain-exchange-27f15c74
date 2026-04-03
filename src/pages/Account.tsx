import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Globe, Clock, ChevronDown, AlertCircle, CheckCircle2, Shield, Lock, X, Pencil, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' }, { code: 'AL', name: 'Albania', flag: '🇦🇱' }, { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' }, { code: 'AO', name: 'Angola', flag: '🇦🇴' }, { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' }, { code: 'AM', name: 'Armenia', flag: '🇦🇲' }, { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' }, { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' }, { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' }, { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' }, { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' }, { code: 'BE', name: 'Belgium', flag: '🇧🇪' }, { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' }, { code: 'BT', name: 'Bhutan', flag: '🇧🇹' }, { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' }, { code: 'BW', name: 'Botswana', flag: '🇧🇼' }, { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' }, { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' }, { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' }, { code: 'KH', name: 'Cambodia', flag: '🇰🇭' }, { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' }, { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' }, { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' }, { code: 'CL', name: 'Chile', flag: '🇨🇱' }, { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' }, { code: 'KM', name: 'Comoros', flag: '🇰🇲' }, { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' }, { code: 'HR', name: 'Croatia', flag: '🇭🇷' }, { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' }, { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' }, { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' }, { code: 'DM', name: 'Dominica', flag: '🇩🇲' }, { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' }, { code: 'EG', name: 'Egypt', flag: '🇪🇬' }, { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' }, { code: 'ER', name: 'Eritrea', flag: '🇪🇷' }, { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' }, { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' }, { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' }, { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' }, { code: 'GE', name: 'Georgia', flag: '🇬🇪' }, { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' }, { code: 'GR', name: 'Greece', flag: '🇬🇷' }, { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' }, { code: 'GN', name: 'Guinea', flag: '🇬🇳' }, { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' }, { code: 'HT', name: 'Haiti', flag: '🇭🇹' }, { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' }, { code: 'IS', name: 'Iceland', flag: '🇮🇸' }, { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' }, { code: 'IR', name: 'Iran', flag: '🇮🇷' }, { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' }, { code: 'IL', name: 'Israel', flag: '🇮🇱' }, { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' }, { code: 'JP', name: 'Japan', flag: '🇯🇵' }, { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' }, { code: 'KE', name: 'Kenya', flag: '🇰🇪' }, { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' }, { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' }, { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' }, { code: 'LB', name: 'Lebanon', flag: '🇱🇧' }, { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' }, { code: 'LY', name: 'Libya', flag: '🇱🇾' }, { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' }, { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' }, { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' }, { code: 'MY', name: 'Malaysia', flag: '🇲🇾' }, { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' }, { code: 'MT', name: 'Malta', flag: '🇲🇹' }, { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' }, { code: 'MU', name: 'Mauritius', flag: '🇲🇺' }, { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' }, { code: 'MD', name: 'Moldova', flag: '🇲🇩' }, { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' }, { code: 'ME', name: 'Montenegro', flag: '🇲🇪' }, { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' }, { code: 'MM', name: 'Myanmar', flag: '🇲🇲' }, { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' }, { code: 'NP', name: 'Nepal', flag: '🇳🇵' }, { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' }, { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' }, { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' }, { code: 'KP', name: 'North Korea', flag: '🇰🇵' }, { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' }, { code: 'OM', name: 'Oman', flag: '🇴🇲' }, { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' }, { code: 'PS', name: 'Palestine', flag: '🇵🇸' }, { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' }, { code: 'PY', name: 'Paraguay', flag: '🇵🇾' }, { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' }, { code: 'PL', name: 'Poland', flag: '🇵🇱' }, { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' }, { code: 'RO', name: 'Romania', flag: '🇷🇴' }, { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' }, { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' }, { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent', flag: '🇻🇨' }, { code: 'WS', name: 'Samoa', flag: '🇼🇸' }, { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' }, { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' }, { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' }, { code: 'SC', name: 'Seychelles', flag: '🇸🇨' }, { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' }, { code: 'SK', name: 'Slovakia', flag: '🇸🇰' }, { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' }, { code: 'SO', name: 'Somalia', flag: '🇸🇴' }, { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' }, { code: 'SS', name: 'South Sudan', flag: '🇸🇸' }, { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' }, { code: 'SD', name: 'Sudan', flag: '🇸🇩' }, { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' }, { code: 'CH', name: 'Switzerland', flag: '🇨🇭' }, { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' }, { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' }, { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' }, { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' }, { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' }, { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' }, { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' }, { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' }, { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' }, { code: 'UA', name: 'Ukraine', flag: '🇺🇦' }, { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' }, { code: 'US', name: 'United States', flag: '🇺🇸' }, { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' }, { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' }, { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' }, { code: 'VN', name: 'Vietnam', flag: '🇻🇳' }, { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' }, { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

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
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [address, setAddress] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);

  const selectedCountryObj = COUNTRIES.find(c => c.name === country);
  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#2B3040] bg-[#1C1E2D] px-3 md:px-6">
        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => navigate('/trade')} className="p-2 text-[#6B7280] hover:text-[#E0E2E7] mr-1 md:mr-2 flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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

        <div className="hidden md:flex items-center gap-6 text-sm">
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
        <div className="max-w-[1400px] mx-auto p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_280px] gap-6 md:gap-8">

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

                <div className="relative" ref={countryRef}>
                  <button
                    type="button"
                    onClick={() => { setCountryOpen(!countryOpen); setCountrySearch(''); }}
                    className="w-full border border-[#3A4255] rounded-lg bg-[#242833] px-3 pt-4 pb-2 text-left"
                  >
                    <label className="absolute top-1.5 left-3 text-[10px] text-[#6B7280]">Country</label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        {selectedCountryObj && <span className="text-base">{selectedCountryObj.flag}</span>}
                        {country}
                      </span>
                      <ChevronDown size={14} className={`text-[#6B7280] transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {countryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#242833] border border-[#3A4255] rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-[#3A4255]">
                          <div className="flex items-center gap-2 bg-[#1A1D29] rounded-md px-3 py-2">
                            <Search size={14} className="text-[#6B7280]" />
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              autoFocus
                              className="w-full bg-transparent text-sm text-[#E0E2E7] outline-none placeholder:text-[#4A5265]"
                            />
                          </div>
                        </div>
                        <div data-lenis-prevent className="max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#3A4255 #242833', overscrollBehavior: 'contain' }}>
                          {filteredCountries.length === 0 && (
                            <div className="px-3 py-4 text-center text-sm text-[#6B7280]">No countries found</div>
                          )}
                          {filteredCountries.map(c => (
                            <button
                              key={c.code}
                              onClick={() => { setCountry(c.name); setCountryOpen(false); setCountrySearch(''); }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#2B3040] transition-colors text-left ${
                                country === c.name ? 'bg-[#2B3040] text-[#0EB85B]' : 'text-[#E0E2E7]'
                              }`}
                            >
                              <span className="text-base">{c.flag}</span>
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
