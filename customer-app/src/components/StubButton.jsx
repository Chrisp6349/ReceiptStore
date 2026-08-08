// A UI entry point for a feature Prototype 001 deliberately doesn't
// implement (export, share, warranty, return, Apple Wallet...). Clicking
// it says so instead of silently doing nothing or faking success.
export function StubButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="stub-button"
      onClick={() => window.alert(`"${children}" isn't available in this prototype yet.`)}
      {...props}
    >
      {children}
    </button>
  );
}
