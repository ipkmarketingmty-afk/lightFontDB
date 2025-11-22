import { NextRequest, NextResponse } from 'next/server'
import { parseDbSession, createPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const credentials = parseDbSession(cookieHeader)
  
  if (!credentials) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const pool = createPool(credentials)
  
  try {
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='status'
    `
    
    const columnExists = await pool.query(checkColumnQuery)
    
    if (columnExists.rows.length === 0) {
      const addColumnQuery = `
        ALTER TABLE products 
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'activo'
      `
      
      await pool.query(addColumnQuery)
      await pool.end()
      return NextResponse.json({ 
        success: true, 
        message: 'Columna "status" agregada exitosamente' 
      })
    } else {
      await pool.end()
      return NextResponse.json({ 
        success: true, 
        message: 'La columna "status" ya existe' 
      })
    }
  } catch (error: any) {
    await pool.end()
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
