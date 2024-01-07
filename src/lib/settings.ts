import { GM } from "$";
import { writable, type Writable } from "svelte/store";

const platformSettingKey = "platform";
const allArtistsSettingKey = "allArtists";

export type Platform = {
  id: string;
  name: string;
};
export const platforms: Platform[] = [
  { id: "ytmusic", name: "YouTube Music" },
  { id: "youtube", name: "YouTube" },
];

export function makePlatformSearchURL(id: string, query: string): URL | null {
  const encodedQuery = encodeURIComponent(query);
  switch (id) {
    case "ytmusic":
      return new URL(`https://music.youtube.com/search?q=${encodedQuery}`);
    case "youtube":
      return new URL(
        `https://www.youtube.com/results?search_query=${encodedQuery}`,
      );
    default:
      return null;
  }
}

async function createPlatformSetting(): Promise<Writable<string>> {
  const initialValue = await GM.getValue(platformSettingKey, platforms[0].id);
  const store: Writable<string> = writable(initialValue);
  return {
    subscribe: store.subscribe,
    set: (value) => {
      GM.setValue(platformSettingKey, value);
      store.set(value);
    },
    update: (updater) => {
      const newUpdater = (value: string) => {
        const newValue = updater(value);
        GM.setValue(platformSettingKey, newValue);
        return newValue;
      };
      store.update(newUpdater);
    },
  };
}
export const platformSetting = await createPlatformSetting();

async function createAllArtistsSetting(): Promise<Writable<boolean>> {
  const initialValue = await GM.getValue(allArtistsSettingKey, true);
  const store: Writable<boolean> = writable(initialValue);
  return {
    subscribe: store.subscribe,
    set: (value) => {
      GM.setValue(allArtistsSettingKey, value);
      store.set(value);
    },
    update: (updater) => {
      const newUpdater = (value: boolean) => {
        const newValue = updater(value);
        GM.setValue(allArtistsSettingKey, newValue);
        return newValue;
      };
      store.update(newUpdater);
    },
  };
}
export const allArtistsSetting = await createAllArtistsSetting();
