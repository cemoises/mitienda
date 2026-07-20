export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación: ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(rating);
        return (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-black"
          >
            <path
              d="M12 2.5l2.9 6.02 6.6.87-4.8 4.6 1.2 6.51L12 17.6l-5.9 3.9 1.2-6.51-4.8-4.6 6.6-.87L12 2.5z"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}
