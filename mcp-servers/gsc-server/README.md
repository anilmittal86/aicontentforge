# MCP Server for Google Search Console

This MCP server connects AI models to Google Search Console API to fetch top performing queries.

## Setup

### 1. Install dependencies
```bash
cd mcp-servers/gsc-server
npm install
```

### 2. Configure Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Search Console API**:
   - Go to APIs & Services > Library
   - Search for "Search Console API"
   - Enable it

4. Create OAuth credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Desktop app"
   - Download the JSON

5. Save the JSON as `credentials.json` in this folder

### 3. Run the server
```bash
npm start
```

### 4. Connect to Claude Desktop

Add to `~/.claude/projects/{project-id}/mcp.json`:
```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "node",
      "args": ["/path/to/mcp-servers/gsc-server/dist/index.js"]
    }
  }
}
```

## Available Tools

### `get_top_queries`
Get top performing queries from GSC.

**Parameters:**
- `siteUrl`: Your site URL (e.g., `sc-domain:yourdomain.com`)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `rowLimit`: Number of rows (default: 1000)

**Returns:** Array of queries with impressions, clicks, CTR, position

### `get_page_performance`
Get performance data for specific pages.

**Parameters:**
- `siteUrl`: Your site URL
- `startDate`: Start date
- `endDate`: End date
- `pageUrl`: Specific page URL (optional)

### `get_search_type_breakdown`
Get breakdown by search type (web, image, video, news).

## Usage Example

```
User: Show me my top 20 queries from GSC for the last 30 days

Assistant: I'll fetch that data from Google Search Console...
[Calls get_top_queries with rowLimit: 20]
```

## Data Format

The GSC data comes with:
- **Query**: The search query
- **Clicks**: Number of clicks
- **Impressions**: Number of impressions  
- **CTR**: Click-through rate
- **Position**: Average search position

This data can directly feed into content briefs for high-performing topics.
