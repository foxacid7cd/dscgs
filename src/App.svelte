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

  const pageInfo = getPageInfo();

  type TracklistContent = {
    type: "tracklist";
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
            artists: master.artists,
            tracklist: master.tracklist.filter((v) => v.type_ == "track"),
          };
        case "release":
          const release = await fetchDiscogsRelease(pageInfo.id);
          return {
            type: "tracklist",
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
    let artist: string = "";
    if (artists.length > 0) {
      if ($allArtistsSetting) {
        artist = artists.map((v) => formattedArtistName(v)).join(", ");
      } else {
        artist = formattedArtistName(artists[0]);
      }
    }
    return [artist, track.title].filter((v) => v.length > 0).join(" - ");
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
  <div class="container" transition:fade={{ duration: 300 }}>
    {#if content.type == "tracklist"}
      <div class="settings">
        <h1>Tracklist</h1>
        <div class="allArtists">
          <label for="allArtists" style="padding-right: 2px">All artists</label>
          <input
            type="checkbox"
            bind:checked={$allArtistsSetting}
            id="allArtists"
          />
        </div>
        <div class="platform">
          <label for="platform">Open in</label>
          <select bind:value={$platformSetting}>
            {#each platforms as platform}
              <option value={platform.id}>{platform.name}</option>
            {/each}
          </select>
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
    box-sizing: border-box;
  }

  .container {
    margin-bottom: 20px;
  }

  .settings {
    padding-left: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    font-size: small;
  }

  .allArtists {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  h1 {
    flex: 1;
  }

  select {
    padding: 2px;
    min-height: 20px;
    border-radius: 4px;
    font-size: small;
  }

  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  button {
    padding: 8px;
    text-align: left;
    border: none;
    font-family: inherit;
    cursor: pointer;
    background-color: #eee;
    border-radius: 4px;
    border: 1px solid #333;
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

  button,
  select,
  label {
    font-size: 13px;
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
</style>
