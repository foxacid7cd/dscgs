import App from "./App.svelte";
import { makeCurrentPageInfo } from "./lib/page";
import { fetchTracklistContent } from "./lib/tracklist";

function waitForContentElement(
  handler: (element: Element) => void,
  counter: number = 0,
) {
  const element = document.querySelector("#page");
  if (element) {
    handler(element);
  } else if (counter < 100) {
    setTimeout(() => {
      waitForContentElement(handler, counter + 1);
    }, 200);
  } else {
    console.error("waiting for element timed out");
  }
}

const pageInfo = makeCurrentPageInfo();
if (pageInfo.type !== "other") {
  const tracklistContent = fetchTracklistContent(pageInfo);
  waitForContentElement((contentElement) => {
    new App({
      target: (() => {
        const div = document.createElement("div");
        contentElement.prepend(div);
        return div;
      })(),
      props: {
        pageInfo,
        tracklistContent,
      },
    });
  });
}
