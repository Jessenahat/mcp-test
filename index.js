const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const toolsManifest = [
  {
    name: "list_fields",
    description: "List dataset columns",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "search_facilities",
    description: "Search facilities by province and/or facility type",
    input_schema: {
      type: "object",
      properties: {
        province: { type: "string" },
        facility_type: { type: "string" }
      }
    }
  }
];

app.get('/sse_once', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('event: message\n');
  res.write(`data: ${JSON.stringify({ event: "list_tools", data: { tools: toolsManifest } })}\n\n`);
  setTimeout(() => res.end(), 100); // closes connection after short delay
});

// You can add more endpoints here (e.g., /list_fields or /search_facilities with csv/json data)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
