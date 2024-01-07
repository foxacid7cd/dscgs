import { GM } from "$";
import { writable, type Writable } from "svelte/store";

const key = "platform";

export type Platform = {
  id: string;
  name: string;
};
export const platforms: Platform[] = [
  { id: "ytmusic", name: "YouTube Music" },
  { id: "youtube", name: "YouTube" },
];

export function makePlatformSearchURL(id: string, query: string): URL | null {
  switch (id) {
    case "ytmusic":
      return new URL(`https://music.youtube.com/search?q=${query}`);
    case "youtube":
      return new URL(`https://www.youtube.com/results?search_query=${query}`);
    default:
      return null;
  }
}

async function createPlatform(): Promise<Writable<string>> {
  const initialValue = await GM.getValue(key, platforms[0].id);
  const store: Writable<string> = writable(initialValue);
  return {
    subscribe: store.subscribe,
    set: (value) => {
      GM.setValue(key, value);
      store.set(value);
    },
    update: (updater) => {
      const newUpdater = (value: string) => {
        const newValue = updater(value);
        GM.setValue(key, newValue);
        return newValue;
      };
      store.update(newUpdater);
    },
  };
}
export const platform = await createPlatform();
