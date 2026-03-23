import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

interface QueryResult {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const server = new Server(
  {
    name: 'google-search-console',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let oauth2Client: OAuth2Client;
let searchconsole: ReturnType<typeof google.searchconsole>;

// Initialize Google Auth
function initializeAuth() {
  const credentialsPath = path.join(__dirname, 'credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    oauth2Client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
    searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client,
    });
  } else {
    console.error('credentials.json not found. Please add your Google API credentials.');
    process.exit(1);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_top_queries',
        description: 'Get top performing search queries from Google Search Console',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL (e.g., sc-domain:yourdomain.com)',
            },
            startDate: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            rowLimit: {
              type: 'number',
              description: 'Number of rows to return (default: 100)',
            },
          },
          required: ['siteUrl', 'startDate', 'endDate'],
        },
      },
      {
        name: 'get_page_performance',
        description: 'Get performance data for specific pages from Google Search Console',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL',
            },
            startDate: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            pageUrl: {
              type: 'string',
              description: 'Specific page URL (optional)',
            },
          },
          required: ['siteUrl', 'startDate', 'endDate'],
        },
      },
      {
        name: 'get_queries_by_position',
        description: 'Get queries where you rank in a specific position range',
        inputSchema: {
          type: 'object',
          properties: {
            siteUrl: {
              type: 'string',
              description: 'Your site URL',
            },
            startDate: {
              type: 'string',
              description: 'Start date (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date (YYYY-MM-DD)',
            },
            minPosition: {
              type: 'number',
              description: 'Minimum position (e.g., 5 for top 5)',
            },
            maxPosition: {
              type: 'number',
              description: 'Maximum position',
            },
          },
          required: ['siteUrl', 'startDate', 'endDate'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_top_queries') {
      initializeAuth();
      
      const response = await searchconsole.searchanalytics.query({
        siteUrl: args.siteUrl,
        requestBody: {
          startDate: args.startDate,
          endDate: args.endDate,
          dimensions: ['query'],
          rowLimit: args.rowLimit || 100,
          aggregationType: 'byPage',
        },
      });

      const rows = (response.data.rows || []) as QueryResult[];
      const formatted = rows.map((row, i) => ({
        rank: i + 1,
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
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

    if (name === 'get_page_performance') {
      initializeAuth();
      
      const requestBody: any = {
        startDate: args.startDate,
        endDate: args.endDate,
        dimensions: ['query', 'page'],
        rowLimit: args.rowLimit || 100,
      };

      if (args.pageUrl) {
        requestBody.dimensionFilterGroups = [{
          filters: [{
            dimension: 'page',
            operator: 'equals',
            expression: args.pageUrl,
          }],
        }];
      }

      const response = await searchconsole.searchanalytics.query({
        siteUrl: args.siteUrl,
        requestBody,
      });

      const rows = (response.data.rows || []) as QueryResult[];
      const formatted = rows.map((row) => ({
        query: row.keys[0],
        page: row.keys[1],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: (row.ctr * 100).toFixed(2) + '%',
        position: row.position.toFixed(1),
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

    if (name === 'get_queries_by_position') {
      initializeAuth();
      
      const response = await searchconsole.searchanalytics.query({
        siteUrl: args.siteUrl,
        requestBody: {
          startDate: args.startDate,
          endDate: args.endDate,
          dimensions: ['query'],
          rowLimit: 500,
        },
      });

      const rows = (response.data.rows || []) as QueryResult[];
      const filtered = rows
        .filter(row => {
          const pos = row.position;
          return pos >= (args.minPosition || 1) && pos <= (args.maxPosition || 10);
        })
        .map((row, i) => ({
          rank: i + 1,
          query: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: (row.ctr * 100).toFixed(2) + '%',
          position: row.position.toFixed(1),
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(filtered, null, 2),
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
  console.error('Google Search Console MCP Server running on stdio');
}

main().catch(console.error);
