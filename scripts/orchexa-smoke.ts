import crypto from 'crypto'

const CLIENT_ID = process.env.ORCHEXA_CLIENT_ID || 'ocx_client_b4b15422d65cc136acab8ec5'
const CLIENT_SECRET = process.env.ORCHEXA_CLIENT_SECRET
const AGENT_ID = process.env.ORCHEXA_AGENT_ID || '911aa67c-1a89-4418-ac9e-f451c51a0629'
const API_BASE = (process.env.ORCHEXA_API_BASE || 'https://api.orchexa.io').replace(/\/$/, '')
const PATH = '/api/v1/embedded/sessions'

async function runSmokeTest() {
  console.log('--- Orchexa Embedded AI Smoke Test ---')
  console.log(`API Base: ${API_BASE}`)
  console.log(`Client ID: ${CLIENT_ID}`)
  console.log(`Agent ID: ${AGENT_ID}`)
  console.log(`Client Secret configured: ${CLIENT_SECRET && !CLIENT_SECRET.includes('<paste') ? 'YES' : 'NO (or placeholder)'}`)

  if (!CLIENT_SECRET || CLIENT_SECRET.includes('<paste')) {
    console.error('\n[!] ORCHEXA_CLIENT_SECRET is missing or still contains the placeholder.')
    console.error('Please get your secret from: Orchexa Dashboard -> Agent -> Embedded AI -> Embedded Clients tab.')
    console.error('Add it to your .env file or export ORCHEXA_CLIENT_SECRET="your_secret"\n')
    process.exit(1)
  }

  const bodyObj = {
    agent_id: AGENT_ID,
    external_user_id: 'u_smoketest',
    external_tenant_id: 't_smoketest',
    channel: 'crm_web',
    resume_last: true,
  }
  const body = JSON.stringify(bodyObj)
  const ts = Math.floor(Date.now() / 1000).toString()
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const canonical = `POST\n${PATH}\n${ts}\n${bodyHash}`
  const sig = crypto.createHmac('sha256', CLIENT_SECRET).update(canonical).digest('hex')

  console.log(`Canonical String:\n${canonical}\n`)
  console.log(`HMAC-SHA256 Signature: ${sig}`)
  console.log(`Sending POST to ${API_BASE}${PATH}...`)

  const res = await fetch(`${API_BASE}${PATH}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'OrchexaBFF/1.0 (SmokeTest)',
      'X-Orchexa-Client-Id': CLIENT_ID,
      'X-Orchexa-Timestamp': ts,
      'X-Orchexa-Signature': sig,
      'Content-Type': 'application/json',
    },
    body,
  })

  const text = await res.text()
  console.log(`\nHTTP Response Status: ${res.status}`)
  console.log(`Response Body: ${text}`)

  if (res.ok) {
    console.log('\n[SUCCESS] Orchexa session token created successfully!')
  } else {
    console.log('\n[ERROR] Request failed. Check your credentials or agent configuration.')
  }
}

runSmokeTest().catch((err) => {
  console.error('Smoke test exception:', err)
  process.exit(1)
})
