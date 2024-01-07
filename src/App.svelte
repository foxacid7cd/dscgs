<script lang="ts">
  import {
    fetchDiscogsMaster,
    type DiscogsTrack,
    fetchDiscogsRelease,
    type DiscogsArtist,
  } from "./lib/discogs";
  import { getPageInfo } from "./lib/page";
  import { fade } from "svelte/transition";
  import { makePlatformSearchURL, platform, platforms } from "./lib/platform";

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

  function formattedTrackTitle(
    pageArtists: DiscogsArtist[],
    track: DiscogsTrack,
  ): string {
    let artist: string = "";
    if (track.artists && track.artists.length > 0) {
      artist = track.artists.map((v) => v.name).join(", ");
    } else if (pageArtists.length > 0) {
      artist = pageArtists.map((v) => v.name).join(", ");
    }
    if (artist) {
      const match = /^(?<name>.+) \([0-9]+\)$/.exec(artist);
      if (match && match.groups) {
        artist = match.groups.name;
      }
    }
    return [artist, track.title].filter((v) => v.length > 0).join(" - ");
  }

  function onTrackClick(title: string) {
    const url = makePlatformSearchURL($platform, title);
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
        <div class="platform">
          <label for="platform">Open in</label>
          <select bind:value={$platform}>
            {#each platforms as platform}
              <option value={platform.id}>{platform.name}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="tracklist">
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
      </div>
    </div>
  {/if}
{:catch error}
  <div class="container">
    <h1 class="error">dscgs error</h1>
    <p class="error">{error}</p>
  </div>
{/await}

<style>
  .container {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    justify-content: left;
    border-radius: 4px;
    gap: 4px;
  }

  .settings {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  h1 {
    flex: 1;
    padding-left: 8px;
  }

  select {
    margin-left: 4px;
    padding: 4px;
  }

  .tracklist {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .track {
    padding: 8px;
    text-align: left;
  }

  .error {
    color: darkred;
  }
</style>
