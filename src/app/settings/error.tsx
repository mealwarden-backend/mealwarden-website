'use client';
import ErrorDisplay from '@/components/ErrorDisplay';
export default function SettingsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorDisplay error={error} reset={reset} page="Settings" />;
}
