<script lang="ts">
  import {
    fetchDiscogsMaster,
    type DiscogsTrack,
    fetchDiscogsRelease,
  } from "./lib/discogs";
  import { getPageInfo } from "./lib/page";
  import { fade } from "svelte/transition";

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
    window.open(`https://music.youtube.com/search?q=${track.title}`);
  }
</script>

{#if content}
  {#await content.tracklist then tracklist}
    <div class="container">
      <div class="tracklist" transition:fade={{ duration: 300 }}>
        {#each tracklist as track}
          <button class="track" on:click={() => onTrackClick(track)}>
            <span>{track.title}</span>
          </button>
        {/each}
      </div>
    </div>
  {:catch error}
    <div class="container">
      <p>{error}</p>
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
