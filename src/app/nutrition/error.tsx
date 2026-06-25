'use client';
import ErrorDisplay from '@/components/ErrorDisplay';
export default function NutritionError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorDisplay error={error} reset={reset} page="Nutrition" />;
}
