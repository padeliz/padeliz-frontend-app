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

/** Level assessment screen; `eventId` is only used to return to the event afterwards. */
export function levelAssessmentPath(eventId?: number | null): EventRoute {
  const params: Record<string, string> = {};
  if (eventId != null) params.eventId = String(eventId);
  return { pathname: '/level-assessment', params };
}

/** Discovery intercept; `target` is where to go once Discovery is submitted. */
export function discoveryPath(
  target: 'assessment' | 'registration',
  eventId?: number | null
): EventRoute {
  const params: Record<string, string> = { target };
  if (eventId != null) params.eventId = String(eventId);
  return { pathname: '/discovery', params };
}

export function studentProofPath(): EventRoute {
  return { pathname: '/student-proof', params: {} };
}

/** Where a level flow ends up (Assess my level vs Register). */
export function levelTargetPath(
  target: 'assessment' | 'registration',
  eventId?: number | null
): EventRoute {
  if (target === 'registration' && eventId != null) {
    return eventRegistrationPath(eventId);
  }
  return levelAssessmentPath(eventId);
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
