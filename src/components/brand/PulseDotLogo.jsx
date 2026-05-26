export function PulseDotLogo({ className = "h-9 w-9" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-md bg-[#111118] ring-1 ring-[#2f2f3d] ${className}`}
    >
      <svg
        className="h-[70%] w-[70%]"
        fill="none"
        viewBox="0 0 32 32"
      >
        <path
          d="M3.5 16H8.6L11.4 10.5L15.6 22L19.3 13.4L21.4 16H28.5"
          stroke="#A78BFA"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
        <circle cx="16" cy="16" fill="#34D399" r="4.2" />
        <circle
          cx="16"
          cy="16"
          r="8.4"
          stroke="#34D399"
          strokeOpacity="0.22"
          strokeWidth="1.6"
        />
      </svg>
    </span>
  );
}
