import { Pool } from 'pg'
import { parse } from 'cookie'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

export interface DbCredentials {
  host: string
  port: number
  user: string
  password: string
  database: string
}

if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET environment variable is required for secure session management. ' +
    'Please set it to a random string of at least 32 characters.'
  )
}

const SESSION_SECRET = process.env.SESSION_SECRET

const encryptionKey = scryptSync(SESSION_SECRET, 'salt', 32)

function encryptCredentials(credentials: DbCredentials): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv)
  
  const json = JSON.stringify(credentials)
  let encrypted = cipher.update(json, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}.${encrypted}.${authTag.toString('hex')}`
}

function decryptCredentials(encryptedData: string): DbCredentials | null {
  try {
    const [ivHex, encrypted, authTagHex] = encryptedData.split('.')
    
    if (!ivHex || !encrypted || !authTagHex) {
      return null
    }
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

export function parseDbSession(cookieHeader: string | null): DbCredentials | null {
  if (!cookieHeader) return null
  
  const cookies = parse(cookieHeader)
  const sessionValue = cookies.db_session
  
  if (!sessionValue) return null
  
  return decryptCredentials(sessionValue)
}

export function encodeDbSession(credentials: DbCredentials): string {
  return encryptCredentials(credentials)
}

export function destroySession(_cookieHeader: string | null): void {
  // No server-side cleanup needed with encrypted cookies
}

export async function testConnection(credentials: DbCredentials): Promise<boolean> {
  const pool = new Pool({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    max: 1,
    connectionTimeoutMillis: 5000,
  })
  
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    await pool.end()
    return true
  } catch (error) {
    await pool.end()
    return false
  }
}

export function createPool(credentials: DbCredentials): Pool {
  return new Pool({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
}

export async function ensureProductsTable(pool: Pool): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'activo',
      image BYTEA,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
  
  await pool.query(createTableQuery)
}
