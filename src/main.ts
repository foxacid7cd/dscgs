import "./app.css";
import { fetchDiscogsMaster, fetchDiscogsRelease } from "./lib/discogs";
import { getPageInfo } from "./lib/page";

// const app = new App({
//   target: (() => {
//     const app = document.createElement("div");
//     document.body.append(app);
//     return app;
//   })(),
// });

const pageInfo = getPageInfo();
switch (pageInfo.type) {
  case "master":
    try {
      const master = await fetchDiscogsMaster(pageInfo.id);
      console.log(master);
    } catch (error) {
      console.error(error);
    }
    break;
  case "release":
    try {
      const release = await fetchDiscogsRelease(pageInfo.id);
      console.log(release);
    } catch (error) {
      console.error(error);
    }
    break;
  case "other":
    console.log(`other ${document.URL}`);
    break;
}

// GM.xmlHttpRequest({
//   url: "https://api.discogs.com/releases/28510360",
//   method: "get",
//   headers: {
//     "User-Agent": "dscgs/0.0.1",
//     Authorization: "Discogs token=",
//   },
//   onerror(event) {
//     console.error(event.error);
//   },
//   onload(event) {
//     console.log(event.responseText);
//   },
// });

// export default app;
