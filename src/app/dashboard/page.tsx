import { StarshipsDashboard } from '@/components/dashboard/starships-dashboard';
import { requireAuthenticatedUser } from '@/lib/api/require-auth-user';
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  getAccessibleStarships,
  parseIntegerQueryParam,
} from '@/lib/starships/accessible-starships';
import { redirect } from 'next/navigation';

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireAuthenticatedUser();

  if (!user) {
    redirect('/login?redirect=%2Fdashboard');
  }

  const params = await searchParams;
  const offset = parseIntegerQueryParam(
    Array.isArray(params.offset) ? params.offset[0] : (params.offset ?? null),
    DEFAULT_OFFSET,
  );
  const limit = parseIntegerQueryParam(
    Array.isArray(params.limit) ? params.limit[0] : (params.limit ?? null),
    DEFAULT_LIMIT,
  );
  const search = Array.isArray(params.search) ? params.search[0] : (params.search ?? '');
  const fleet = Array.isArray(params.fleet) ? params.fleet[0] : (params.fleet ?? '');

  const response = await getAccessibleStarships(user, {
    offset,
    limit,
    search,
    fleet,
  });

  return <StarshipsDashboard user={user} response={response} searchParams={params} />;
}
