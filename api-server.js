import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

// Parse .env manually to load environment variables
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

// Set process.env variables so db-client.js and other files can read them
for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
}

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`[API Server] ${req.method} ${pathname}`);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (pathname.startsWith('/api/')) {
        const functionName = pathname.replace('/api/', '');
        const handlerPath = path.resolve(`./api/${functionName}.js`);

        if (fs.existsSync(handlerPath)) {
            try {
                // Dynamically import the handler (handling Windows file:// URL scheme compatibility)
                const fileUrl = new URL(`file://${handlerPath.replace(/\\/g, '/')}`);
                const module = await import(`${fileUrl.href}?update=${Date.now()}`);
                const handler = module.default;

                // Mock Vercel req/res helpers
                req.query = parsedUrl.query;
                
                // Read request body
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        if (body && req.headers['content-type']?.includes('application/json')) {
                            req.body = JSON.parse(body);
                        } else {
                            req.body = body;
                        }
                    } catch (e) {
                        req.body = body;
                    }

                    // Mock Vercel response helper functions
                    res.status = (code) => {
                        res.statusCode = code;
                        return res;
                    };
                    res.json = (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                        return res;
                    };
                    res.setHeaderOrigin = res.setHeader; // alias
                    res.send = (data) => {
                        res.end(data);
                        return res;
                    };

                    try {
                        await handler(req, res);
                    } catch (err) {
                        console.error(`Error in handler ${functionName}:`, err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: err.message }));
                    }
                });
            } catch (err) {
                console.error(`Failed to load handler for ${functionName}:`, err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `Internal Server Error: ${err.message}` }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `API route /api/${functionName} not found` }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`[API Server] Running on http://localhost:${PORT}`);
});
