'use client'
import ErrorDisplay from '@/components/ErrorDisplay'
export default function CirclesError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorDisplay error={error} reset={reset} />
}
