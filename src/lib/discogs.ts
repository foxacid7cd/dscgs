import { name, version } from "../../package.json";
import { z } from "zod";
import { GM } from "$";

const DiscogsArtist = z.object({
  name: z.string(),
});
export type DiscogsArtist = z.infer<typeof DiscogsArtist>;

const DiscogsTrackType = z.enum(["track", "heading"]);
export type DiscogsTrackType = z.infer<typeof DiscogsTrackType>;

const DiscogsTrack = z.object({
  artists: z.array(DiscogsArtist).optional(),
  title: z.string(),
  position: z.string(),
  type_: DiscogsTrackType,
  duration: z.string(),
});
export type DiscogsTrack = z.infer<typeof DiscogsTrack>;

const DiscogsRelease = z.object({
  artists: z.array(DiscogsArtist),
  tracklist: z.array(DiscogsTrack),
});
export type DiscogsRelease = z.infer<typeof DiscogsRelease>;

const DiscogsMaster = z.object({
  artists: z.array(DiscogsArtist),
  tracklist: z.array(DiscogsTrack),
});
export type DiscogsMaster = z.infer<typeof DiscogsMaster>;

function fetchDiscogsAPI(pathname: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    GM.xmlHttpRequest({
      url: `https://api.discogs.com${pathname}`,
      method: "get",
      headers: {
        "User-Agent": `${name}/${version}`,
      },
      responseType: "json",
      onload(event) {
        resolve(event.response);
      },
      onerror(event) {
        reject(event.error);
      },
    });
  });
}

export async function fetchDiscogsRelease(id: string): Promise<DiscogsRelease> {
  const json = await fetchDiscogsAPI(`/releases/${id}`);
  return DiscogsRelease.parse(json);
}

export async function fetchDiscogsMaster(id: string): Promise<DiscogsMaster> {
  const json = await fetchDiscogsAPI(`/masters/${id}`);
  return DiscogsMaster.parse(json);
}
