import fs from 'fs';

// Parse .env manually
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

const projectRef = env.FULLSTACK_PROJECT_REF;
const restoreUrl = env.FULLSTACK_RESTORE_API_URL;

console.log("Project Ref:", projectRef);
console.log("Restore URL:", restoreUrl);

if (!projectRef || !restoreUrl) {
    console.error("Missing credentials in .env file.");
    process.exit(1);
}

async function run() {
    try {
        console.log("Triggering restore...");
        const res = await fetch(restoreUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_ref: projectRef })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
