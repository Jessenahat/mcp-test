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

const fs = require('fs');
const csv = require('csv-parser');

app.get('/list_fields', (req, res) => {
  const results = [];
  fs.createReadStream('odhf_v1.1.csv')
    .pipe(csv())
    .on('headers', (headers) => {
      res.json({columns: headers});
    })
    .on('error', err => {
      res.status(500).json({error: err.message});
    });
});

app.get('/search_facilities', (req, res) => {
  const { province, facility_type } = req.query;
  const results = [];
  fs.createReadStream('odhf_v1.1.csv')
    .pipe(csv())
    .on('data', (data) => {
      if (
        (!province || (data['Province'] && data['Province'].toLowerCase().includes(province.toLowerCase()))) &&
        (!facility_type || (data['Facility Type'] && data['Facility Type'].toLowerCase().includes(facility_type.toLowerCase())))
      ) {
        results.push(data);
      }
    })
    .on('end', () => {
      res.json(results.slice(0, 25)); // return only the first 25 matches
    })
    .on('error', err => {
      res.status(500).json({error: err.message});
    });
});



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MCP server running on ${port}`));
