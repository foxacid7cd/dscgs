<script lang="ts">
  import { type DiscogsTrack, type DiscogsArtist } from "./lib/discogs";
  import { type MasterPageInfo, type ReleasePageInfo } from "./lib/page";
  import { fade } from "svelte/transition";
  import { settings } from "./lib/stores";
  import type { TracklistContent } from "./lib/tracklist";

  export let content: TracklistContent;

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

<div class="wrapper">
  <div class="container" in:fade={{ duration: 200 }}>
    <div class="header">
      <div class="content-title cell">Tracklist</div>
      <div style="flex: 1" />
      <div class="settings">
        <label class="isAllArtists cell">
          <label for="isAllArtists">Include all artists</label>
          <input
            type="checkbox"
            bind:checked={$settings.isAllArtists}
            id="isAllArtists"
          />
        </label>
        <label class="isYTMusic cell">
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
      <div class="tracklist">
        {#each content.tracklist as track}
          {#if track.type_ == "track"}
            {@const title = formattedTrackTitle(content.artists, track)}
            <button class="track" on:click={() => onTrackClick(title)}>
              {#if track.position.length > 0}
                <div class="position">
                  {track.position}
                </div>
              {/if}
              <div class="title">
                {title}
              </div>
              {#if track.duration.length > 0}
                <div class="duration">
                  {track.duration}
                </div>
              {/if}
            </button>
          {:else if track.type_ == "heading"}
            <div class="heading">
              {track.title}
            </div>
          {/if}
        {/each}
      </div>
    {/key}
  </div>
</div>

<style>
  * {
    font-family: system-ui, sans-serif;
    font-size: 13px;
    box-sizing: border-box;
  }

  .wrapper {
    max-width: calc(1288px + 4em);
    display: flex;
    justify-content: left;
  }

  .container {
    max-width: 560px;
    width: 100%;
    margin: 0;
    margin-bottom: 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    background-color: rgb(245, 244, 236);

    @media (max-width: 700px) {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .content-title {
    padding-left: 12px;
    padding-right: 12px;
    font-weight: bold;
    background-color: #fff;
    border: 1px solid rgb(206, 205, 198);
  }

  .settings {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .settings > * {
    gap: 5px;
    padding-left: 12px;
    padding-right: 12px;
    background-color: #fff;
    border: 1px solid #bbb;
  }

  .settings label,
  .settings input[type="checkbox"] {
    cursor: pointer;
  }

  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tracklist > .heading {
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

  .tracklist > .track {
    display: flex;
    flex-direction: row;
    align-items: first baseline;
    gap: 8px;
  }

  .track > .position {
    font-weight: bold;
  }

  .track > .title {
    flex: 1;
  }

  .track > .duration {
    font-weight: lighter;
  }

  .cell {
    padding-top: 8px;
    padding-bottom: 8px;
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
