export function Button({ onClick, text }: { onClick: () => void; text: string }) {
  return (
    <button
      className="rounded-md bg-blue-600 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg active:bg-blue-700 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
