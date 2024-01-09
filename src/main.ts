import "./main.css";
import App from "./App.svelte";
import { makeCurrentPageInfo } from "./lib/page";
import { fetchTracklistContent } from "./lib/tracklist";

async function getDeferredElement(selector: string): Promise<Element> {
  const waitForTracklistElement = (params: {
    counter: number;
    onSuccess: (element: Element) => void;
    onFailure: (error: Error) => void;
  }) => {
    const element = document.querySelector(selector);
    if (element) {
      params.onSuccess(element);
    } else if (params.counter < 100) {
      setTimeout(() => {
        waitForTracklistElement({
          counter: params.counter + 1,
          onSuccess: params.onSuccess,
          onFailure: params.onFailure,
        });
      }, 250);
    } else {
      const error = new Error(`waiting for ${selector} element timed out`);
      params.onFailure(error);
    }
  };
  return new Promise((onSuccess, onFailure) => {
    waitForTracklistElement({
      counter: 0,
      onSuccess,
      onFailure,
    });
  });
}

async function main(): Promise<void> {
  const pageInfo = makeCurrentPageInfo();
  if (pageInfo.type === "other") {
    return;
  }
  try {
    const content = await fetchTracklistContent(pageInfo);
    const tracklistElement = await getDeferredElement(
      "section#release-tracklist",
    );
    new App({
      target: (() => {
        const div = document.createElement("div");
        tracklistElement.replaceWith(div);
        return div;
      })(),
      props: {
        pageInfo,
        content,
      },
    });
  } catch (error) {
    console.error(`dscgs failed: ${error}`);
  }
}
main();
