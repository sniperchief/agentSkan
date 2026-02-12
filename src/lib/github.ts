import { RepoMetadata } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AgentSkan/1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname !== "github.com" && urlObj.hostname !== "www.github.com") {
      return null;
    }

    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    if (pathParts.length < 2) {
      return null;
    }

    const owner = pathParts[0];
    const repo = pathParts[1].replace(/\.git$/, "");

    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const headers = getHeaders();

  // Fetch main repo data
  const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers,
  });

  if (!repoResponse.ok) {
    if (repoResponse.status === 404) {
      throw new Error("Repository not found");
    }
    throw new Error(`GitHub API error: ${repoResponse.status}`);
  }

  const repoData = await repoResponse.json();

  // Fetch contributors count
  let contributorsCount = 0;
  try {
    const contributorsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
      { headers }
    );
    if (contributorsResponse.ok) {
      const linkHeader = contributorsResponse.headers.get("Link");
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        contributorsCount = match ? parseInt(match[1], 10) : 1;
      } else {
        const contributors = await contributorsResponse.json();
        contributorsCount = Array.isArray(contributors) ? contributors.length : 0;
      }
    }
  } catch {
    contributorsCount = 0;
  }

  // Fetch recent commits (last 30 days)
  let recentCommitCount = 0;
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const commitsResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=100`,
      { headers }
    );
    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      recentCommitCount = Array.isArray(commits) ? commits.length : 0;
    }
  } catch {
    recentCommitCount = 0;
  }

  // Fetch README
  let hasReadme = false;
  let readmeContent: string | null = null;
  try {
    const readmeResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      { headers }
    );
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      hasReadme = true;
      if (readmeData.content) {
        readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }
    }
  } catch {
    hasReadme = false;
  }

  const createdAt = new Date(repoData.created_at);
  const pushedAt = new Date(repoData.pushed_at);
  const now = new Date();

  const ageInDays = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const lastPushDaysAgo = Math.floor(
    (now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    name: repoData.name,
    owner: repoData.owner.login,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    watchers: repoData.watchers_count,
    openIssues: repoData.open_issues_count,
    createdAt: repoData.created_at,
    pushedAt: repoData.pushed_at,
    defaultBranch: repoData.default_branch,
    ageInDays,
    lastPushDaysAgo,
    contributorsCount,
    recentCommitCount,
    hasReadme,
    readmeContent,
  };
}
