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

  const pageInfo = getPageInfo();

  type TracklistContent = {
    artists: DiscogsArtist[];
    tracklist: DiscogsTrack[];
  };
  type Content = TracklistContent | null;
  async function makeContent(): Promise<Content> {
    switch (pageInfo.type) {
      case "master":
        const master = await fetchDiscogsMaster(pageInfo.id);
        return {
          artists: master.artists,
          tracklist: master.tracklist,
        };
      case "release":
        const release = await fetchDiscogsRelease(pageInfo.id);
        return {
          artists: release.artists,
          tracklist: release.tracklist,
        };
      case "other":
        return null;
    }
  }
  const content = makeContent();

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
</script>

{#await content then content}
  {#if content}
    <div class="container">
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
            <button
              class="track"
              on:click={() => onTrackClick(title)}
              transition:fade={{ duration: 300 }}
            >
              {#if track.position.length > 0}
                <b>{track.position}</b>
              {/if}
              <span style="margin-left: 4px">
                {title}
              </span>
            </button>
          {/each}
        {/key}
      </div>
    </div>
  {/if}
{:catch error}
  <div class="container">
    <p class="error"><b>dscgs error</b><br />{error}</p>
  </div>
{/await}

<style>
  .container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: left;
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
    background-color: #eaeaea;
    color: #000;
    border-radius: 4px;
    border: 1px solid #000;
  }

  button:hover {
    background-color: #d7d7d7;
  }

  button:active {
    background-color: #cfcfcf;
  }

  .error {
    color: darkred;
  }
</style>
