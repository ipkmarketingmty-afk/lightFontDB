import { NextRequest, NextResponse } from 'next/server'
import { parseDbSession, createPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const credentials = parseDbSession(cookieHeader)
  
  if (!credentials) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const pool = createPool(credentials)
  
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, stock, status, image, created_at, updated_at FROM products ORDER BY created_at DESC'
    )
    
    const products = result.rows.map((row) => ({
      ...row,
      image: row.image ? `data:image/jpeg;base64,${row.image.toString('base64')}` : null,
    }))
    
    await pool.end()
    return NextResponse.json({ products })
  } catch (error: any) {
    await pool.end()
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const credentials = parseDbSession(cookieHeader)
  
  if (!credentials) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const pool = createPool(credentials)
  
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const status = (formData.get('status') as string) || 'activo'
    const imageFile = formData.get('image') as File | null
    
    let imageBuffer: Buffer | null = null
    
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) {
        await pool.end()
        return NextResponse.json(
          { error: 'La imagen es muy pesada. Máximo 5MB.' },
          { status: 400 }
        )
      }
      
      const arrayBuffer = await imageFile.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, status, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, stock, status, imageBuffer]
    )
    
    const product = result.rows[0]
    
    if (product.image) {
      product.image = `data:image/jpeg;base64,${product.image.toString('base64')}`
    }
    
    await pool.end()
    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    await pool.end()
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
