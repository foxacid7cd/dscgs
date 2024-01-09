<script lang="ts">
  import { type DiscogsTrack, type DiscogsArtist } from "./lib/discogs";
  import { type MasterPageInfo, type ReleasePageInfo } from "./lib/page";
  import { fade, blur } from "svelte/transition";
  import { settings } from "./lib/stores";
  import type { TracklistContent } from "./lib/tracklist";

  export let pageInfo: MasterPageInfo | ReleasePageInfo;
  export let tracklistContent: Promise<TracklistContent>;

  function formattedArtistName(artist: DiscogsArtist): string {
    const match = /^(?<name>.+) \([0-9]+\)$/.exec(artist.name);
    if (match && match.groups) {
      return match.groups.name;
    } else {
      return artist.name;
    }
  }

  function formattedTitle(title: string, artists: DiscogsArtist[]): string {
    const formattedArtistNames = artists.map(formattedArtistName).join(", ");
    return [formattedArtistNames, title].join(" - ");
  }

  function formattedTrackTitle(
    pageArtists: DiscogsArtist[],
    track: DiscogsTrack,
  ): string {
    let artists: DiscogsArtist[] = [];
    if (track.artists && track.artists.length > 0) {
      artists = track.artists;
    } else if (pageArtists.length > 0) {
      artists = pageArtists;
    }
    if (!$settings.isAllArtists) {
      artists = artists.slice(0, 1);
    }
    return formattedTitle(track.title, artists);
  }

  function makeContentTitle(): string {
    switch (pageInfo.type) {
      case "master":
        return `Master Tracklist`;
      case "release":
        return `Release Tracklist`;
    }
  }

  function makeSearchQueryURL(query: string): URL {
    const encodedQuery = encodeURIComponent(query);
    if ($settings.isYTMusic) {
      return new URL(`https://music.youtube.com/search?q=${encodedQuery}`);
    } else {
      return new URL(
        `https://www.youtube.com/results?search_query=${encodedQuery}`,
      );
    }
  }

  function onTrackClick(title: string) {
    const url = makeSearchQueryURL(title);
    window.open(url);
  }
</script>

{#await tracklistContent then content}
  <div class="dscgs-wrapper">
    <div class="dscgs-container" in:fade={{ duration: 200 }}>
      <div class="dscgs-header">
        <div class="dscgs-content-title dscgs-cell">
          {makeContentTitle()}
        </div>
        <div style="flex: 1" />
        <div class="dscgs-settings">
          <label class="isAllArtists dscgs-cell">
            <label for="isAllArtists">Include all artists</label>
            <input
              type="checkbox"
              bind:checked={$settings.isAllArtists}
              id="isAllArtists"
            />
          </label>
          <label class="isYTMusic dscgs-cell">
            <label for="isYTMusic">YouTube Music</label>
            <input
              type="checkbox"
              bind:checked={$settings.isYTMusic}
              id="isYTMusic"
            />
          </label>
        </div>
      </div>
      {#key $settings.isAllArtists}
        <div class="dscgs-tracklist">
          {#each content.tracklist as track}
            {#if track.type_ == "track"}
              {@const title = formattedTrackTitle(content.artists, track)}
              <button class="dscgs-track" on:click={() => onTrackClick(title)}>
                {#if track.position.length > 0}
                  <div class="dscgs-position">
                    {track.position}
                  </div>
                {/if}
                <div class="dscgs-title">
                  {title}
                </div>
                {#if track.duration.length > 0}
                  <div class="dscgs-duration">
                    {track.duration}
                  </div>
                {/if}
              </button>
            {:else if track.type_ == "heading"}
              <div class="dscgs-heading">
                {track.title}
              </div>
            {/if}
          {/each}
        </div>
      {/key}
    </div>
  </div>
{/await}

<style>
  * {
    font-family: system-ui, sans-serif;
    font-size: 13px;
    box-sizing: border-box;
  }

  .dscgs-wrapper {
    max-width: calc(1288px + 4em);
    width: 100%;
    margin: 0 auto;
    padding: 0 2em;
    display: flex;
    justify-content: left;

    @media (max-width: 1100px) {
      padding: 0 8px;
    }
  }

  .dscgs-container {
    max-width: 600px;
    width: 100%;
    margin-bottom: 1.5rem;
    border: 1px solid #ccc;
    padding: 8px;
    background-color: #efefef;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  }

  .dscgs-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .dscgs-content-title {
    padding-left: 12px;
    padding-right: 12px;
    font-weight: bold;
    background-color: #fff;
    border: 1px solid #bbb;
  }

  .dscgs-settings {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .dscgs-settings > * {
    gap: 5px;
    padding-left: 12px;
    padding-right: 12px;
    background-color: #fff;
    border: 1px solid #bbb;
  }

  .dscgs-settings label,
  .dscgs-settings input[type="checkbox"] {
    cursor: pointer;
  }

  .dscgs-tracklist {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dscgs-tracklist > .dscgs-heading {
    padding-top: 8px;
    padding-bottom: 2px;
    padding-left: 8px;
    padding-right: 8px;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  button {
    appearance: none;
    color: #000;
    cursor: pointer;
    text-align: left;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #bbb;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  button:hover {
    background-color: #ddd;
  }

  button:active {
    background-color: #ccc;
  }

  .dscgs-tracklist > .dscgs-track {
    display: flex;
    flex-direction: row;
    gap: 6px;
  }

  .dscgs-track > .dscgs-position {
    font-weight: bold;
  }

  .dscgs-track > .dscgs-title {
    flex: 1;
  }

  .dscgs-track > .dscgs-duration {
    color: #000;
  }

  .dscgs-cell {
    height: 30px;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }

  input[type="checkbox"] {
    appearance: none;
    outline: none;
    border-radius: 4px;
    border: 1px solid #000;
    margin: 0;
    width: 1.1em;
    height: 1.1em;
    font: inherit;
    display: grid;
    place-content: center;
    color: #3252d1;
  }

  input[type="checkbox"]::before {
    content: "";
    width: 0.7em;
    height: 0.7em;
    opacity: 0;
    transition: 50ms opacity;
    box-shadow: inset 1.2em 1.2em currentColor;
    transform-origin: bottom left;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  input[type="checkbox"]:checked::before {
    opacity: 1;
  }
</style>
