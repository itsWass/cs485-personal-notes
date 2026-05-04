import axios from "axios";

export interface Resource {
  type: "github" | "youtube" | "hackernews" | "arxiv";
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  source: string;
  relevance: number;
  concepts: string[];
}

export async function searchGitHub(
  queries: string[],
  concepts: string[]
): Promise<Resource[]> {
  const results: Resource[] = [];

  for (const query of queries.slice(0, 2)) {
    try {
      const res = await axios.get("https://api.github.com/search/repositories", {
        params: { q: query, sort: "stars", order: "desc", per_page: 5 },
        headers: { Accept: "application/vnd.github.v3+json" },
      });

      for (const repo of res.data.items || []) {
        results.push({
          type: "github",
          title: repo.full_name,
          description: repo.description || "No description",
          url: repo.html_url,
          thumbnail: repo.owner?.avatar_url || "",
          source: "GitHub",
          relevance: Math.min(repo.stargazers_count / 10000, 1),
          concepts,
        });
      }
    } catch {
      // GitHub rate limit or network error — skip
    }
  }

  return results.slice(0, 8);
}

export async function searchYouTube(
  queries: string[],
  concepts: string[]
): Promise<Resource[]> {
  const results: Resource[] = [];
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return results;

  for (const query of queries.slice(0, 2)) {
    try {
      const res = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: query,
            type: "video",
            maxResults: 5,
            relevanceLanguage: "en",
            key: apiKey,
          },
        }
      );

      for (const item of res.data.items || []) {
        results.push({
          type: "youtube",
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails?.medium?.url || "",
          source: "YouTube",
          relevance: 0.85,
          concepts,
        });
      }
    } catch {
      // YouTube quota or network error — skip
    }
  }

  return results.slice(0, 8);
}

export async function searchHackerNews(
  queries: string[],
  concepts: string[]
): Promise<Resource[]> {
  const results: Resource[] = [];

  for (const query of queries.slice(0, 2)) {
    try {
      const res = await axios.get(
        "https://hn.algolia.com/api/v1/search",
        {
          params: { query, tags: "story", hitsPerPage: 5 },
        }
      );

      for (const hit of res.data.hits || []) {
        if (!hit.url) continue;
        results.push({
          type: "hackernews",
          title: hit.title,
          description: `${hit.points || 0} points · ${hit.num_comments || 0} comments`,
          url: hit.url,
          thumbnail: "",
          source: "Hacker News",
          relevance: Math.min((hit.points || 0) / 1000, 1),
          concepts,
        });
      }
    } catch {
      // HN API error — skip
    }
  }

  return results.slice(0, 6);
}

export async function searchArxiv(
  queries: string[],
  concepts: string[]
): Promise<Resource[]> {
  const results: Resource[] = [];

  for (const query of queries.slice(0, 1)) {
    try {
      const res = await axios.get("https://export.arxiv.org/api/query", {
        params: {
          search_query: `all:${query}`,
          start: 0,
          max_results: 5,
          sortBy: "relevance",
        },
        headers: { Accept: "application/xml" },
      });

      const entries = res.data.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
      for (const entry of entries.slice(0, 4)) {
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
        const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);

        if (!titleMatch || !idMatch) continue;

        results.push({
          type: "hackernews",
          title: titleMatch[1].trim().replace(/\n/g, " "),
          description: summaryMatch
            ? summaryMatch[1].trim().slice(0, 200) + "..."
            : "",
          url: idMatch[1].trim(),
          thumbnail: "",
          source: "arXiv",
          relevance: 0.8,
          concepts,
        });
      }
    } catch {
      // arXiv error — skip
    }
  }

  return results.slice(0, 4);
}

export async function fetchAllResources(
  searchQueries: { github: string[]; youtube: string[]; articles: string[] },
  concepts: string[]
): Promise<Resource[]> {
  const [github, youtube, hn, arxiv] = await Promise.all([
    searchGitHub(searchQueries.github, concepts),
    searchYouTube(searchQueries.youtube, concepts),
    searchHackerNews(searchQueries.articles, concepts),
    searchArxiv(searchQueries.articles, concepts),
  ]);

  // Interleave sources so the feed gets a balanced mix instead of all-GitHub
  const all: Resource[] = [];
  const maxLen = Math.max(github.length, youtube.length, hn.length, arxiv.length);
  for (let i = 0; i < maxLen; i++) {
    if (github[i]) all.push(github[i]);
    if (youtube[i]) all.push(youtube[i]);
    if (hn[i]) all.push(hn[i]);
    if (arxiv[i]) all.push(arxiv[i]);
  }
  return all;
}
