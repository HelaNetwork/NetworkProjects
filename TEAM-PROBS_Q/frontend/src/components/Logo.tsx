export function PayStreamLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Background rounded square */}
            <rect width="48" height="48" rx="12" fill="url(#bg-gradient)" />

            {/* Inner glow */}
            <rect x="1" y="1" width="46" height="46" rx="11" stroke="url(#border-glow)" strokeWidth="0.5" opacity="0.4" />

            {/* Stream wave symbol — 3 flowing lines */}
            <path
                d="M12 28C14.5 24 17.5 22 20 22C23.5 22 23.5 28 27 28C30.5 28 30.5 22 34 22C36.5 22 38 24 38 26"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.35"
            />
            <path
                d="M10 24C12.5 20 15.5 18 18 18C21.5 18 21.5 24 25 24C28.5 24 28.5 18 32 18C34.5 18 37 20 38 22"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
            />
            <path
                d="M10 20C13 15.5 16 14 19 14C22.5 14 22.5 20 26 20C29.5 20 29.5 14 33 14C35.5 14 37.5 16 38 18"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
            />

            {/* Small dollar circle — bottom right */}
            <circle cx="36" cy="35" r="7.5" fill="rgba(255,255,255,0.15)" />
            <circle cx="36" cy="35" r="7.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
            <text
                x="36"
                y="39"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
            >
                $
            </text>

            <defs>
                <linearGradient id="bg-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0284c7" />
                    <stop offset="0.5" stopColor="#0ea5e9" />
                    <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="border-glow" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* Small favicon-sized version — simplified */
export function PayStreamLogoSmall({ size = 24, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width="32" height="32" rx="8" fill="url(#sm-bg)" />
            <path
                d="M7 14C9 10.5 11 10 13 10C15.5 10 15.5 14 18 14C20.5 14 20.5 10 23 10C24.5 10 25.5 11 26 12"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M7 19C9 15.5 11 15 13 15C15.5 15 15.5 19 18 19C20.5 19 20.5 15 23 15C24.5 15 25.5 16 26 17"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
            />
            <defs>
                <linearGradient id="sm-bg" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0" stopColor="#0284c7" />
                    <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
        </svg>
    );
}
