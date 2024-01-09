import {
  fetchDiscogsMaster,
  type DiscogsArtist,
  type DiscogsTrack,
  fetchDiscogsRelease,
} from "./discogs";
import type { MasterPageInfo, ReleasePageInfo } from "./page";

export type TracklistContent = {
  title: string;
  artists: DiscogsArtist[];
  tracklist: DiscogsTrack[];
};

export async function fetchTracklistContent(
  pageInfo: MasterPageInfo | ReleasePageInfo,
): Promise<TracklistContent> {
  const { title, artists, tracklist } =
    pageInfo.type == "master"
      ? await fetchDiscogsMaster(pageInfo.id)
      : await fetchDiscogsRelease(pageInfo.id);
  return {
    title,
    artists,
    tracklist,
  };
}
