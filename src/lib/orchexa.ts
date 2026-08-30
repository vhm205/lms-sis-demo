import crypto from 'crypto'

const DEFAULT_CLIENT_ID = 'ocx_client_b4b15422d65cc136acab8ec5'
const DEFAULT_AGENT_ID = '911aa67c-1a89-4418-ac9e-f451c51a0629'
const DEFAULT_API_BASE = 'https://api.orchexa.io'
const PATH = '/api/v1/embedded/sessions'

export interface CreateOrchexaSessionOptions {
  resumeLast?: boolean
  conversationId?: string
  /** Customer profile from your CRM — orders/students/attendance/tickets/etc.
   *  Passed as initial_context.customer or initialContext so the AI knows the caller
   *  before their first message. */
  customerProfile?: Record<string, unknown>
  initialContext?: Record<string, unknown>
}

export async function createOrchexaSession(
  externalUserId: string,
  externalTenantId: string,
  opts: CreateOrchexaSessionOptions = { resumeLast: true }
) {
  const clientId = process.env.ORCHEXA_CLIENT_ID || DEFAULT_CLIENT_ID
  const clientSecret = process.env.ORCHEXA_CLIENT_SECRET
  const agentId = process.env.ORCHEXA_AGENT_ID || DEFAULT_AGENT_ID
  const apiBase = (process.env.ORCHEXA_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '')

  if (!clientSecret || clientSecret.includes('<paste')) {
    throw new Error(
      'ORCHEXA_CLIENT_SECRET is not configured or still contains placeholder. Please set a valid ORCHEXA_CLIENT_SECRET in your .env.'
    )
  }

  const bodyObj: Record<string, unknown> = {
    agent_id: agentId,
    external_user_id: externalUserId,
    external_tenant_id: externalTenantId,
    channel: 'crm_web',
    resume_last: opts.resumeLast !== false,
  }
  if (opts.conversationId) bodyObj.conversation_id = opts.conversationId
  if (opts.initialContext) {
    bodyObj.initial_context = opts.initialContext
  } else if (opts.customerProfile) {
    bodyObj.initial_context = { customer: opts.customerProfile }
  }

  const body = JSON.stringify(bodyObj)
  const ts = Math.floor(Date.now() / 1000).toString()
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
  const canonical = `POST\n${PATH}\n${ts}\n${bodyHash}`
  const sig = crypto.createHmac('sha256', clientSecret).update(canonical).digest('hex')

  const r = await fetch(`${apiBase}${PATH}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'OrchexaBFF/1.0 (Next.js)',
      'X-Orchexa-Client-Id': clientId,
      'X-Orchexa-Timestamp': ts,
      'X-Orchexa-Signature': sig,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!r.ok) {
    const errText = await r.text()
    throw new Error(`Orchexa create session failed: ${r.status} ${errText}`)
  }

  return r.json() as Promise<{ session_token: string; conversation_id: string }>
}
