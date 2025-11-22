'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import AddProductModal from './AddProductModal'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  status: string
  image: string | null
  created_at: string
  updated_at: string
}

export default function InventoryClient() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [initializingTable, setInitializingTable] = useState(false)
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/')
          return
        }
        throw new Error(data.error || 'Error al cargar productos')
      }
      
      setProducts(data.products)
      setError('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  
  const handleInitTable = async () => {
    setInitializingTable(true)
    try {
      const response = await fetch('/api/products/init-table', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error)
      }
      
      alert('Tabla creada exitosamente')
      await fetchProducts()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setInitializingTable(false)
    }
  }
  
  const handleMigrate = async () => {
    if (!confirm('¿Deseas agregar la columna "status" a la tabla products?')) return
    
    setInitializingTable(true)
    try {
      const response = await fetch('/api/products/migrate-status', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error)
      }
      
      alert(data.message)
      await fetchProducts()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setInitializingTable(false)
    }
  }
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      
      await fetchProducts()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-vault-navy">BlackVault Inventory</h1>
            <p className="text-gray-600">{products.length} productos en inventario</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleInitTable}
              className="btn-vault text-sm"
              disabled={initializingTable}
            >
              {initializingTable ? 'Inicializando...' : 'Crear Tabla'}
            </button>
            <button
              onClick={handleMigrate}
              className="btn-vault text-sm"
              disabled={initializingTable}
            >
              Migrar Estado
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-vault-primary">
              + Nuevo Producto
            </button>
            <button onClick={handleLogout} className="btn-vault">
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        {error && error.includes('does not exist') && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-lg text-yellow-800">
            <p className="font-medium mb-2">
              {error.includes('column') ? 'La columna "status" no existe' : 'La tabla "products" no existe'}
            </p>
            <p className="text-sm mb-3">
              {error.includes('column') 
                ? 'Haz clic en "Migrar Estado" para agregar la columna a tu tabla existente.' 
                : 'Haz clic en "Crear Tabla" para inicializar la base de datos.'}
            </p>
          </div>
        )}
        
        {error && !error.includes('does not exist') && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-800">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-vault-navy border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 card-vault">
            <p className="text-gray-600 mb-4">No hay productos en el inventario</p>
            <button onClick={() => setShowAddModal(true)} className="btn-vault-primary">
              Agregar Primer Producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null)
            fetchProducts()
          }}
        />
      )}
      
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}
