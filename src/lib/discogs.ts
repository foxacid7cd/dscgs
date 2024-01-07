import gmFetch from "@sec-ant/gm-fetch";
import { name, version } from "../../package.json";
import { z } from "zod";

const DiscogsArtist = z.object({
  name: z.string(),
});
export type DiscogsArtist = z.infer<typeof DiscogsArtist>;

const DiscogsTrack = z.object({
  artists: z.array(DiscogsArtist).optional(),
  title: z.string(),
  position: z.string(),
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

async function fetchDiscogsAPI(pathname: string): Promise<any> {
  const response = await gmFetch(`https://api.discogs.com${pathname}`, {
    method: "get",
    headers: {
      "User-Agent": `${name}/${version}`,
    },
  });
  return await response.json();
}

export async function fetchDiscogsRelease(id: string): Promise<DiscogsRelease> {
  const json = await fetchDiscogsAPI(`/releases/${id}`);
  return DiscogsRelease.parse(json);
}

export async function fetchDiscogsMaster(id: string): Promise<DiscogsMaster> {
  const json = await fetchDiscogsAPI(`/masters/${id}`);
  return DiscogsMaster.parse(json);
}
