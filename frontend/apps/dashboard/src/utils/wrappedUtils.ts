import type { WrappedOrganMemberResponse, WrappedResponse } from '@gewis/sudosos-client';

export function organName({ organ }: WrappedOrganMemberResponse): string {
  return `${organ.firstName} ${organ.lastName}`.trim();
}

/**
 * The organ for which the user created the most turnover, relative to its other sellers.
 */
export function bestOrgan(wrapped: WrappedResponse): WrappedOrganMemberResponse | undefined {
  return [...wrapped.organs].sort((a, b) => a.ordinalTurnoverCreated - b.ordinalTurnoverCreated)[0];
}
