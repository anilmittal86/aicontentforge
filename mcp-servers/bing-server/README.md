# MCP Server for Bing Webmaster Tools

This MCP server connects to Bing Webmaster API to fetch query data and site performance.

## Setup

### 1. Get Bing Webmaster API Key

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in with your Microsoft account
3. Go to Settings > API Access
4. Copy your API Key

### 2. Install dependencies
```bash
cd mcp-servers/bing-server
npm install
```

### 3. Create .env file
```
BING_API_KEY=your_api_key_here
```

### 4. Run the server
```bash
npm start
```

### 5. Connect to Claude Desktop

Add to `~/.claude/projects/{project-id}/mcp.json`:
```json
{
  "mcpServers": {
    "bing-webmaster": {
      "command": "node",
      "args": ["/path/to/mcp-servers/bing-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### `get_bing_top_queries`
Get top performing queries from Bing.

**Parameters:**
- `siteUrl`: Your site URL
- `topRows`: Number of rows to return (default: 100)

### `get_bing_page_queries`
Get queries for a specific page.

**Parameters:**
- `siteUrl`: Your site URL
- `pageUrl`: The page URL to get queries for

### `get_bing_crawl_issues`
Get crawl issues for your site.

## Notes

- Bing Webmaster has different metrics than GSC
- Data includes: Crawl date, Clicks, Impressions, Avg. position
- Great for comparing with GSC data to find cross-platform opportunities
