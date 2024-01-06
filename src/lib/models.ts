import { z } from "zod";

export const DiscogsArtist = z.object({
  name: z.string(),
});
export type DiscogsArtist = z.infer<typeof DiscogsArtist>;

export const DiscogsTrack = z.object({
  title: z.string(),
});
export type DiscogsTrack = z.infer<typeof DiscogsTrack>;

export const DiscogsRelease = z.object({
  artists: z.array(DiscogsArtist),
  tracklist: z.array(DiscogsTrack),
});
export type DiscogsRelease = z.infer<typeof DiscogsRelease>;
