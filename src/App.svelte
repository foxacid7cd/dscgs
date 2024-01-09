<script lang="ts">
  import { type DiscogsTrack, type DiscogsArtist } from "./lib/discogs";
  import { type MasterPageInfo, type ReleasePageInfo } from "./lib/page";
  import { fade } from "svelte/transition";
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
  <div class="wrapper">
    <div class="container" transition:fade={{ duration: 200 }}>
      <div class="header">
        <div class="content-title cell">
          {makeContentTitle()}
        </div>
        <hr style="flex: 1" />
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
      <div class="tracklist">
        {#key $settings.isAllArtists}
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
        {/key}
      </div>
    </div>
  </div>
{/await}

<style>
  * {
    font-family: sans-serif;
    font-size: 13px;
    box-sizing: border-box;
  }

  .wrapper {
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

  .container {
    max-width: 600px;
    width: 100%;
    margin-bottom: 2rem;
    border: 1px solid #ccc;
    padding: 8px;
    background-color: #efefef;
    box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.15);
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  hr {
    border: 0;
    border-top: 1px solid #bbb;
  }

  .content-title {
    padding-left: 12px;
    padding-right: 12px;
    font-weight: bold;
    background-color: #fff;
    border: 1px solid #bbb;
  }

  .settings {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .settings > * {
    gap: 2px;
    padding-left: 11px;
    padding-right: 8px;
    background-color: #fff;
    border: 1px solid #bbb;
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

  .tracklist > .track {
    padding: 8px;
    text-align: left;
    cursor: pointer;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #bbb;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .tracklist > .track:hover {
    background-color: #ddd;
  }

  .tracklist > .track:active {
    background-color: #ccc;
  }

  .track > .position {
    font-weight: bold;
  }

  .track > .title {
    flex: 1;
  }

  .track > .duration {
    color: #000;
  }

  .cell {
    height: 30px;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }
</style>
