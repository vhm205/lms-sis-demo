import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  const payloadPath = path.join(process.cwd(), 'deploy_payload.json');
  if (!fs.existsSync(payloadPath)) {
    throw new Error('deploy_payload.json not found. Run prepare-deploy.ts first.');
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
  console.log(`Sending deploy request for ${payload.files.length} files to Vercel project ${payload.name}...`);

  // Start mcp-remote process
  const child = spawn('npx', ['-y', 'mcp-remote', 'https://mcp.vercel.com'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let buffer = '';

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.id === 1) {
          // Initialize response, now call tools/call
          console.log('MCP server initialized. Calling deploy_to_vercel...');
          const callMsg = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'deploy_to_vercel',
              arguments: payload,
            },
          };
          child.stdin.write(JSON.stringify(callMsg) + '\n');
        } else if (msg.id === 2) {
          console.log('Deployment response received:');
          console.log(JSON.stringify(msg, null, 2));
          child.kill();
          process.exit(0);
        }
      } catch (err) {
        console.log('Raw output:', line);
      }
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    if (!text.includes('warn') && !text.includes('npm')) {
      console.error('stderr:', text);
    }
  });

  // Send initialize
  const initMsg = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'lms-sis-deployer',
        version: '1.0.0',
      },
    },
  };

  child.stdin.write(JSON.stringify(initMsg) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
