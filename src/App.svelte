<script lang="ts">
  import {
    fetchDiscogsMaster,
    type DiscogsTrack,
    fetchDiscogsRelease,
    type DiscogsArtist,
  } from "./lib/discogs";
  import { getPageInfo } from "./lib/page";
  import { fade } from "svelte/transition";
  import {
    makePlatformSearchURL,
    platformSetting,
    platforms,
    allArtistsSetting,
  } from "./lib/settings";
  import { onMount } from "svelte";
  import { name, version } from "../package.json";

  const pageInfo = getPageInfo();

  type TracklistContent = {
    type: "tracklist";
    title: string;
    artists: DiscogsArtist[];
    tracklist: DiscogsTrack[];
  };
  type ErrorContent = {
    type: "error";
    error: unknown;
  };
  type Content = TracklistContent | ErrorContent | null;
  async function fetchContent(): Promise<Content> {
    try {
      switch (pageInfo.type) {
        case "master":
          const master = await fetchDiscogsMaster(pageInfo.id);
          return {
            type: "tracklist",
            title: master.title,
            artists: master.artists,
            tracklist: master.tracklist.filter((v) => v.type_ == "track"),
          };
        case "release":
          const release = await fetchDiscogsRelease(pageInfo.id);
          return {
            type: "tracklist",
            title: release.title,
            artists: release.artists,
            tracklist: release.tracklist.filter((v) => v.type_ == "track"),
          };
        case "other":
          return null;
      }
    } catch (error) {
      return {
        type: "error",
        error,
      };
    }
  }
  let content: Content = null;

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
    if (!$allArtistsSetting) {
      artists = artists.slice(0, 1);
    }
    return formattedTitle(track.title, artists);
  }

  function onTrackClick(title: string) {
    const url = makePlatformSearchURL($platformSetting, title);
    if (!url) {
      return;
    }
    window.open(url);
  }

  onMount(async () => {
    content = await fetchContent();
  });
</script>

{#if content}
  <div class="container" transition:fade={{ duration: 200 }}>
    {#if content.type == "tracklist"}
      <div class="header">
        <div class="content-title cell">
          {formattedTitle(content.title, content.artists)}
        </div>
        <div style="flex: 1;"></div>
        <div class="settings">
          <div class="allArtists cell">
            <label for="allArtists">All artists</label>
            <input
              type="checkbox"
              bind:checked={$allArtistsSetting}
              id="allArtists"
            />
          </div>
          <div class="platform cell">
            <select id="platform" bind:value={$platformSetting}>
              {#each platforms as platform}
                <option value={platform.id}>{platform.name}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="info cell">
          {name}
          {version}
        </div>
      </div>
      <div class="tracklist">
        {#key $allArtistsSetting}
          {#each content.tracklist as track}
            {@const title = formattedTrackTitle(content.artists, track)}
            <button class="track" on:click={() => onTrackClick(title)}>
              {#if track.position.length > 0}
                <div class="position">
                  <b>{track.position}</b>
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
          {/each}
        {/key}
      </div>
    {:else}
      <p class="error"><b>dscgs error</b><br />{content.error}</p>
    {/if}
  </div>
{/if}

<style>
  * {
    font-family: sans-serif;
    font-size: 13px;
    box-sizing: border-box;
  }

  select {
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
    outline: none;
    text-decoration-line: underline;
  }

  .container {
    max-width: calc(1288px + 4em);
    width: 100%;
    margin: 0 auto;
    margin-top: 1.5rem;
    padding: 0 2em;

    @media (max-width: 1100px) {
      padding: 0 8px;
    }
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 6px;
  }

  .info {
    color: #fff;
    background-color: #00a;
    font-weight: bold;
  }

  .content-title {
    color: #fff;
    background-color: #080;
    font-weight: bold;
  }

  .settings {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .settings > * {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 2px;
    background-color: #eee;
  }

  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  button {
    font-size: 12px;
    padding: 9px;
    text-align: left;
    cursor: pointer;
    background-color: #eee;
    border-radius: 4px;
    border: 1px solid #bbb;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  button:hover {
    background-color: #ddd;
  }

  button:active {
    background-color: #ccc;
  }

  .track > .position {
    color: #333;
  }

  .track > .title {
    flex: 1;
    color: #000;
  }

  .track > .duration {
    color: #333;
  }

  .error {
    color: darkred;
  }

  .cell {
    height: 28px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 12px;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }
</style>
