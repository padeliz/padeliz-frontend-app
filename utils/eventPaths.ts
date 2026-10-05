/**
 * Build in-app and public event paths. Always resolve by numeric id;
 * slug is a cosmetic segment only.
 */

export type EventRoute = {
  pathname: string;
  params: Record<string, string>;
};

export function eventDetailPath(eventId: number, slug?: string | null): string {
  if (slug != null && slug !== '') {
    return `/event/${eventId}/${slug}`;
  }
  return `/event/${eventId}`;
}

export function eventEligibilityPath(eventId: number): EventRoute {
  return {
    pathname: '/event/eligibility-check',
    params: { eventId: String(eventId) },
  };
}

export function eventRegistrationPath(
  eventId: number,
  initialStep?: string | number | null
): EventRoute {
  const params: Record<string, string> = { eventId: String(eventId) };
  if (initialStep != null && initialStep !== '') {
    params.initialStep = String(initialStep);
  }
  return {
    pathname: '/event/registration',
    params,
  };
}
