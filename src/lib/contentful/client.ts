import { createClient, type ContentfulClientApi } from "contentful";

function getClient(): ContentfulClientApi<undefined> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!space || !accessToken) {
    throw new Error(
      "Contentful environment variables are not configured. " +
        "Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN."
    );
  }

  return createClient({ space, accessToken });
}

function getPreviewClient(): ContentfulClientApi<undefined> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

  if (!space || !accessToken) {
    throw new Error(
      "Contentful preview environment variables are not configured."
    );
  }

  return createClient({ space, accessToken, host: "preview.contentful.com" });
}

// Lazy singletons – only created when first accessed at runtime,
// so the build won't crash when env vars are missing.
let _client: ContentfulClientApi<undefined> | null = null;
let _previewClient: ContentfulClientApi<undefined> | null = null;

export const contentfulClient = new Proxy({} as ContentfulClientApi<undefined>, {
  get(_target, prop, receiver) {
    if (!_client) _client = getClient();
    return Reflect.get(_client, prop, receiver);
  },
});

export const previewClient = new Proxy({} as ContentfulClientApi<undefined>, {
  get(_target, prop, receiver) {
    if (!_previewClient) _previewClient = getPreviewClient();
    return Reflect.get(_previewClient, prop, receiver);
  },
});
