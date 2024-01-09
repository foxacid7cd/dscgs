export type MasterPageInfo = {
  type: "master";
  id: string;
};
export type ReleasePageInfo = {
  type: "release";
  id: string;
};
export type OtherPageInfo = {
  type: "other";
};
export type PageInfo = MasterPageInfo | ReleasePageInfo | OtherPageInfo;

export function makeCurrentPageInfo(): PageInfo {
  const url = new URL(document.URL);
  const match = /^\/(?<type>.+)\/(?<id>[0-9]+)-.+/.exec(url.pathname);
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
