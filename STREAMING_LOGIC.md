# Tomito Streaming Architecture

This documentation outlines the streaming strategy for Tomito, focusing on high availability and seamless user experience through a dual-provider approach.

## 1. Overview

Tomito utilizes a tiered streaming strategy to ensure content is always playable. We prioritize direct stream links to remove ads, with a fallback to secure iframes when primary sources are unavailable.

## 2. Provider Hierarchy

We implement a Fallback Mechanism where the system automatically attempts to fetch data from the primary API, failing over to a secondary provider if the request is unsuccessful.

| Priority | Source | Method | Benefit |
| :--- | :--- | :--- | :--- |
| **Primary** | consumet.org | API (Direct Stream) | No Ads, Custom UI |
| **Fallback 1** | vidsrc.to | Iframe | Highly Stable, Resilient |
| **Fallback 2** | moviesapi.club | Iframe | Alternative Source, Reliable |
| **Fallback 3** | vidsrc-embed.ru | Iframe | Fast Alternate Stream |
| **Fallback 4** | multiembed.mov | Iframe | VIP/Subtitle Support |
| **Fallback 5** | vidsrc.me | Iframe | Stable Backup Source |
| **Fallback 6** | player.autoembed.cc | Iframe | Mirror Sources |
| **Fallback 7** | nontongo.win | Iframe | Arabic Fallback |
| **Fallback 8** | 2embed.cc | Iframe | Standard Backup |
| **Fallback 9** | hnembed.cc | Iframe | Back-up Server |

## 3. Implementation Logic

The system uses an asynchronous check to validate the streaming source before rendering the player.

```javascript
/**
 * Fetches direct stream or falls back to iframe
 * @param {string} tmdbId - The ID of the movie/show
 * @returns {Promise<{type: 'api' | 'iframe', url: string}>}
 */
async function getStream(tmdbId) {
  try {
    const response = await fetch(`${API_ENDPOINT}${tmdbId}`);
    if (!response.ok) throw new Error("API Unavailable");
    
    const data = await response.json();
    return { type: 'api', url: data.sources[0].url };
  } catch (error) {
    console.error("Primary API failed:", error);
    return { type: 'iframe', url: `${IFRAME_ENDPOINT}${tmdbId}` };
  }
}
```

## 4. Optimization Guidelines

- **Caching**: Use `localStorage` to cache the stream source for 24 hours to reduce API requests.
- **Timeout**: Always implement a 3-5 second timeout for fetch requests to prevent UI freezing during provider downtime.
- **CORS Management**: If deploying on GitHub Pages, ensure requests are handled through appropriate proxies to avoid blocked headers.

## 5. Maintenance

- **Health Checks**: Regularly monitor the health endpoint of your Consumet instance.
- **Provider Rotation**: Update `MOVIE_SERVERS` and `TV_SERVERS` in `src/lib/tmdb.ts` if a provider becomes deprecated or starts injecting excessive trackers.
