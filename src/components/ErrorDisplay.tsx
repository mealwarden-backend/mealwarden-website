'use client';

/**
 * ErrorDisplay — shared error UI for Next.js App Router error.tsx boundaries.
 *
 * Each route segment imports this and passes the `error` + `reset` props
 * straight through. The component handles:
 *   - Friendly message (falls back to generic copy if no message)
 *   - "Try again" button wired to Next.js reset()
 *   - "Go home" escape hatch
 *   - Dev-mode raw error detail (hidden in production)
 */

import React from 'react';
import Link from 'next/link';

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Optional page label shown in the heading, e.g. "Dashboard" */
  page?: string;
}

export default function ErrorDisplay({ error, reset, page }: ErrorDisplayProps) {
  const heading = page ? `${page} ran into a problem` : 'Something went wrong';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg, #f9fafb)',
      fontFamily: 'var(--font-jakarta, Inter, sans-serif)',
      textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>🌿</div>

      {/* Heading */}
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--text, #111)',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-syne, Sora, sans-serif)',
      }}>
        {heading}
      </h1>

      {/* Friendly message */}
      <p style={{
        fontSize: '1rem',
        color: 'var(--text-muted, #555)',
        maxWidth: '36rem',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        {error?.message && !error.message.toLowerCase().includes('fetch')
          ? error.message
          : "We hit a snag loading this page. It's not you — tap below to try again."}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '0.75rem',
            background: '#1B6B35',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '0.75rem',
            background: 'transparent',
            color: '#1B6B35',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: '1.5px solid #1B6B35',
            textDecoration: 'none',
          }}
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Dev-mode detail */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '2rem', maxWidth: '48rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#999' }}>
            Error detail (dev only)
          </summary>
          <pre style={{
            marginTop: '0.5rem',
            padding: '1rem',
            background: '#1a1a1a',
            color: '#f87171',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {error?.stack || String(error)}
            {error?.digest ? `\n\nDigest: ${error.digest}` : ''}
          </pre>
        </details>
      )}
    </div>
  );
}
