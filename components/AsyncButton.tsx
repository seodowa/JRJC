'use client';

import React, { ButtonHTMLAttributes, ReactNode, useCallback, useMemo, useRef, useState } from 'react';

export type AsyncButtonProps = {
  // Handler can be sync or async. When it returns a Promise and unmanaged mode is used, the button
  // will enter a loading state until it settles. Duplicate clicks are ignored while loading.
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<unknown>;
  // Optional externally controlled loading state. If provided, the component becomes controlled for loading.
  isLoading?: boolean;
  // Optional text or node to show while loading. If omitted, children remain and only spinner shows.
  loadingText?: ReactNode;
  // Custom spinner element. If omitted, a default SVG spinner is shown.
  spinner?: ReactNode;
  // Disable button while loading (default true)
  disableWhileLoading?: boolean;
  // Children (button label/content)
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

/**
 * AsyncButton
 * - Prevents spam clicks by disabling itself while an async onClick is in-flight.
 * - Shows a spinner and optional loading text.
 * - Can be used in controlled (isLoading prop) or uncontrolled mode (internal loading state).
 * - Works for any button type (button, submit, reset). For submit buttons with form onSubmit handlers,
 *   pass isLoading from the parent if you need to reflect submit progress, or attach your logic to onClick.
 */
export default function AsyncButton({
  onClick,
  isLoading: controlledLoading,
  loadingText,
  spinner,
  disableWhileLoading = true,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: AsyncButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = controlledLoading ?? internalLoading;
  const hasAsyncHandlerRef = useRef(false);

  // Determine if onClick returns a Promise (best effort)
  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (!onClick) return;
      // If already loading, ignore
      if (loading) return;

      const result = onClick(e);
      // If parent controls loading, don't manage internal state
      if (controlledLoading !== undefined) return;

      // Best-effort: if handler returned a promise, await it and manage loading state
      if (result && typeof (result as any).then === 'function') {
        hasAsyncHandlerRef.current = true;
        try {
          setInternalLoading(true);
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    },
    [onClick, loading, controlledLoading]
  );

  const isDisabled = useMemo(() => {
    const disabledByLoading = disableWhileLoading && loading;
    return Boolean(disabled || disabledByLoading);
  }, [disabled, disableWhileLoading, loading]);

  const spinnerNode = useMemo(
    () =>
      spinner ?? (
        <svg
          className="animate-spin h-5 w-5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ),
    [spinner]
  );

  return (
    <button
      {...rest}
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={
        // Preserve caller styles and add sensible disabled styles if Tailwind is present
        `${className} ${loading && disableWhileLoading ? 'cursor-not-allowed opacity-70' : ''}`
      }
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          {spinnerNode}
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
