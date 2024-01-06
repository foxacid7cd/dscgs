import App from "./App.svelte";

new App({
  target: (() => {
    const div = document.createElement("div");
    const content = document.querySelector("#page [class^=content_]");
    if (content) {
      content.prepend(div);
    } else {
      console.error("could not find content element");
    }
    return div;
  })(),
});
