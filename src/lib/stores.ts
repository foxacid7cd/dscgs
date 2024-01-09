import { GM } from "$";
import { writable, type Writable } from "svelte/store";
import { z } from "zod";

const settingsKey = "settings";

const Settings = z.object({
  isAllArtists: z.boolean(),
  isYTMusic: z.boolean(),
});
type Settings = z.infer<typeof Settings>;

async function makeSettingsStore(): Promise<Writable<Settings>> {
  const initalRawSettings = await GM.getValue(settingsKey, "{}");
  const result = Settings.safeParse(JSON.parse(initalRawSettings));
  const initialSettings = result.success
    ? result.data
    : { isAllArtists: true, isYTMusic: true };
  const { subscribe, set, update } = writable(initialSettings);
  return {
    subscribe,
    set: (value) => {
      const rawValue = JSON.stringify(value);
      GM.setValue(settingsKey, rawValue);
      set(value);
    },
    update: (updater) => {
      const newUpdater = (value: Settings) => {
        const newValue = updater(value);
        const rawNewValue = JSON.stringify(value);
        GM.setValue(settingsKey, rawNewValue);
        return newValue;
      };
      update(newUpdater);
    },
  };
}
export const settings = await makeSettingsStore();
