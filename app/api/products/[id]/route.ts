import { NextRequest, NextResponse } from 'next/server'
import { parseDbSession, createPool } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    const keepImage = formData.get('keepImage') === 'true'
    
    let query = 'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, status = $5, updated_at = CURRENT_TIMESTAMP'
    const values: any[] = [name, description, price, stock, status]
    
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) {
        await pool.end()
        return NextResponse.json(
          { error: 'La imagen es muy pesada. Máximo 5MB.' },
          { status: 400 }
        )
      }
      
      const arrayBuffer = await imageFile.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)
      query += ', image = $6 WHERE id = $7 RETURNING *'
      values.push(imageBuffer, id)
    } else if (!keepImage) {
      query += ', image = NULL WHERE id = $6 RETURNING *'
      values.push(id)
    } else {
      query += ' WHERE id = $6 RETURNING *'
      values.push(id)
    }
    
    const result = await pool.query(query, values)
    
    if (result.rows.length === 0) {
      await pool.end()
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    
    const product = result.rows[0]
    
    if (product.image) {
      product.image = `data:image/jpeg;base64,${product.image.toString('base64')}`
    }
    
    await pool.end()
    return NextResponse.json({ product })
  } catch (error: any) {
    await pool.end()
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieHeader = request.headers.get('cookie')
  const credentials = parseDbSession(cookieHeader)
  
  if (!credentials) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  const pool = createPool(credentials)
  
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      await pool.end()
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    
    await pool.end()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    await pool.end()
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
