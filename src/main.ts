import "./app.css";

type MasterPageInfo = {
  type: "master";
  id: string;
};
type ReleasePageInfo = {
  type: "release";
  id: string;
};
type OtherPageInfo = {
  type: "other";
};
type PageInfo = MasterPageInfo | ReleasePageInfo | OtherPageInfo;
function getPageInfo(): PageInfo {
  const url = new URL(document.URL);
  const match = /\/(?<type>.+)\/(?<id>[0-9]+)-.+/.exec(url.pathname);
  if (!match || !match.groups) {
    return { type: "other" };
  }
  switch (match.groups.type) {
    case "master":
      return {
        type: "master",
        id: match.groups.id,
      };
    case "release":
      return {
        type: "release",
        id: match.groups.id,
      };
    default:
      return { type: "other" };
  }
}

// function getArtistName(): string | undefined {
//   const header: HTMLElement | null = document.querySelector("h1");
//   if (!header) {
//     return;
//   }
//   const match = /(?<name>.+)\ –\ (.+)$/.exec(header.innerText);
//   if (!match || !match.groups) {
//     return;
//   }
//   return match.groups.name;
// }
//
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
    console.log(`master: ${pageInfo.id}`);
    break;
  case "release":
    console.log(`release: ${pageInfo.id}`);
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
