import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const BING_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

const server = new Server(
  {
    name: 'bing-webmaster',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function getApiKey(): string {
  const apiKey = process.env.BING_API_KEY;
  if (!apiKey) {
    throw new Error('BING_API_KEY environment variable not set');
  }
  return apiKey;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_bing_top_queries',
        description: 'Get top performing queries from Bing Webmaster',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL (URL encoded)',
            },
            topRows: {
              type: 'number',
              description: 'Number of rows to return (default: 100)',
            },
          },
          required: ['siteUrl'],
        },
      },
      {
        name: 'get_bing_page_queries',
        description: 'Get queries driving traffic to a specific page',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL',
            },
            pageUrl: {
              type: 'string',
              description: 'The page URL to get queries for',
            },
          },
          required: ['siteUrl', 'pageUrl'],
        },
      },
      {
        name: 'get_bing_crawl_info',
        description: 'Get Bing crawl statistics for your site',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL',
            },
          },
          required: ['siteUrl'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const apiKey = getApiKey();

  try {
    if (name === 'get_bing_top_queries') {
      const response = await axios.post(
        `${BING_API_BASE}/GetTopQueries`,
        {
          siteUrl: args.siteUrl,
          top: args.topRows || 100,
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = response.data;
      const formatted = (data.d?.Results || []).map((item: any, i: number) => ({
        rank: i + 1,
        query: item.QueryString,
        clicks: item.Clicks,
        impressions: item.Impressions,
        avgPosition: item.AvgImpressionRanking,
        clickRate: item.ClickRatio ? (item.ClickRatio * 100).toFixed(2) + '%' : 'N/A',
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      };
    }

    if (name === 'get_bing_page_queries') {
      const response = await axios.post(
        `${BING_API_BASE}/GetQueriesByPage`,
        {
          siteUrl: args.siteUrl,
          pageUrl: args.pageUrl,
          top: 100,
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = response.data;
      const formatted = (data.d?.Results || []).map((item: any, i: number) => ({
        rank: i + 1,
        query: item.QueryString,
        clicks: item.Clicks,
        impressions: item.Impressions,
        avgPosition: item.AvgImpressionRanking,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      };
    }

    if (name === 'get_bing_crawl_info') {
      const response = await axios.post(
        `${BING_API_BASE}/GetCrawlInfo`,
        {
          siteUrl: args.siteUrl,
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = response.data;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data.d || data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bing Webmaster MCP Server running on stdio');
}

main().catch(console.error);
