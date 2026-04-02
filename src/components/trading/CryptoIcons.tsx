export function BtcIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path
        d="M22.5 14.2c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 .1.1.1.1.1l-.1 0-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2.1 0-3.3-1.5-4.1 1.1-.2 1.9-1.1 2.1-2.6zm-3.8 5.3c-.5 2.1-4.1 1-5.3.7l1-3.8c1.1.3 4.9.8 4.3 3.1zm.5-5.4c-.5 1.9-3.5.9-4.4.7l.8-3.4c1 .2 4.1.7 3.6 2.7z"
        fill="white"
      />
    </svg>
  );
}

export function EthIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16.5 4v8.9l7.5 3.3L16.5 4z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 4L9 16.2l7.5-3.3V4z" fill="white" />
      <path d="M16.5 21.9v6.1l7.5-10.4-7.5 4.3z" fill="white" fillOpacity="0.6" />
      <path d="M16.5 28v-6.1L9 17.6l7.5 10.4z" fill="white" />
      <path d="M16.5 20.6l7.5-4.4-7.5-3.3v7.7z" fill="white" fillOpacity="0.2" />
      <path d="M9 16.2l7.5 4.4v-7.7L9 16.2z" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

export function SolIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#0D0D0D" />
      <defs>
        <linearGradient id="sol-grad" x1="7" y1="24" x2="25" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="0.5" stopColor="#19FB9B" />
          <stop offset="1" stopColor="#00D1FF" />
        </linearGradient>
      </defs>
      <path d="M9.5 20.8a.5.5 0 01.4-.2h14.4a.3.3 0 01.2.5l-2.4 2.4a.5.5 0 01-.4.2H7.3a.3.3 0 01-.2-.5l2.4-2.4z" fill="url(#sol-grad)" />
      <path d="M9.5 8.5a.5.5 0 01.4-.2h14.4a.3.3 0 01.2.5l-2.4 2.4a.5.5 0 01-.4.2H7.3a.3.3 0 01-.2-.5l2.4-2.4z" fill="url(#sol-grad)" />
      <path d="M22.1 14.6a.5.5 0 00-.4-.2H7.3a.3.3 0 00-.2.5l2.4 2.4a.5.5 0 00.4.2h14.4a.3.3 0 00.2-.5l-2.4-2.4z" fill="url(#sol-grad)" />
    </svg>
  );
}

export function BnbIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path
        d="M12.1 14.3L16 10.4l3.9 3.9 2.3-2.3L16 5.8 9.8 12l2.3 2.3zm-6.3 1.7l2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zm6.3 1.7L16 21.6l3.9-3.9 2.3 2.3L16 26.2 9.8 20l2.3-2.3zm10.3-1.7l2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zM18.8 16L16 13.2 13.2 16 16 18.8 18.8 16z"
        fill="white"
      />
    </svg>
  );
}

export function UsdIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <clipPath id="usd-circle"><circle cx="16" cy="16" r="16" /></clipPath>
      <g clipPath="url(#usd-circle)">
        <rect width="32" height="32" fill="#B22234" />
        <rect y="2.46" width="32" height="2.46" fill="white" />
        <rect y="7.38" width="32" height="2.46" fill="white" />
        <rect y="12.31" width="32" height="2.46" fill="white" />
        <rect y="17.23" width="32" height="2.46" fill="white" />
        <rect y="22.15" width="32" height="2.46" fill="white" />
        <rect y="27.08" width="32" height="2.46" fill="white" />
        <rect width="14" height="17.23" fill="#3C3B6E" />
      </g>
    </svg>
  );
}

const iconMap: Record<string, React.FC<{ size?: number }>> = {
  BTC: BtcIcon,
  ETH: EthIcon,
  SOL: SolIcon,
  BNB: BnbIcon,
  USD: UsdIcon,
};

export default function CryptoIcon({ symbol, size = 20 }: { symbol: string; size?: number }) {
  const Icon = iconMap[symbol];
  if (!Icon) return <span className="text-base">{symbol}</span>;
  return <Icon size={size} />;
}
