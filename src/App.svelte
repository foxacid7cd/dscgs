<script lang="ts">
  import {
    fetchDiscogsMaster,
    type DiscogsTrack,
    fetchDiscogsRelease,
  } from "./lib/discogs";
  import { getPageInfo } from "./lib/page";
  import { fade } from "svelte/transition";
  import { makePlatformSearchURL, platform, platforms } from "./lib/platform";

  const pageInfo = getPageInfo();

  async function fetchTracklist(params: {
    type: "master" | "release";
    id: string;
  }): Promise<DiscogsTrack[]> {
    switch (params.type) {
      case "master":
        const master = await fetchDiscogsMaster(params.id);
        return master.tracklist;
      case "release":
        const release = await fetchDiscogsRelease(params.id);
        return release.tracklist;
    }
  }

  type TracklistContent = {
    tracklist: Promise<DiscogsTrack[]>;
  };
  type Content = TracklistContent | null;
  function makeContent(): Content {
    switch (pageInfo.type) {
      case "master":
        return {
          tracklist: fetchTracklist({ type: "master", id: pageInfo.id }),
        };
      case "release":
        return {
          tracklist: fetchTracklist({ type: "release", id: pageInfo.id }),
        };
      case "other":
        return null;
    }
  }
  const content = makeContent();

  function onTrackClick(track: DiscogsTrack) {
    const url = makePlatformSearchURL($platform, track.title);
    if (!url) {
      return;
    }
    window.open(url);
  }
</script>

{#if content}
  {#await content.tracklist then tracklist}
    <div class="container" transition:fade={{ duration: 300 }}>
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
        {#each tracklist as track}
          <button class="track" on:click={() => onTrackClick(track)}>
            <span>{track.title}</span>
          </button>
        {/each}
      </div>
    </div>
  {:catch error}
    <div class="container">
      <h1>{error}</h1>
    </div>
  {/await}
{/if}

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
</style>
