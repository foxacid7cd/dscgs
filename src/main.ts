import App from "./App.svelte";

new App({
  target: (() => {
    const div = document.createElement("div");
    const app = document.querySelector("#app");
    if (app) {
      app.prepend(div);
    } else {
      console.error("could not find content element");
    }
    return div;
  })(),
});
