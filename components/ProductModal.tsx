'use client'

import { useState } from 'react'

interface ProductModalProps {
  product: {
    id: number
    name: string
    description: string
    price: number
    stock: number
    status: string
    image: string | null
  }
  onClose: () => void
  onSave: () => void
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    stock: product.stock.toString(),
    status: product.status,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image)
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setRemoveImage(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveImage = () => {
    setImageFile(null)
    setPreviewUrl(null)
    setRemoveImage(true)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const form = new FormData()
      form.append('name', formData.name)
      form.append('description', formData.description)
      form.append('price', formData.price)
      form.append('stock', formData.stock)
      form.append('status', formData.status)
      
      if (imageFile) {
        form.append('image', imageFile)
      } else if (!removeImage && product.image) {
        form.append('keepImage', 'true')
      }
      
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        body: form,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar')
      }
      
      onSave()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card-vault max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-vault-navy">Editar Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-vault-navy">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-vault-navy">Imagen del Producto</label>
            <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="flex-1 btn-vault text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageFile ? 'Cambiar Imagen' : 'Subir Imagen'}
              </label>
              {(previewUrl || product.image) && (
                <button type="button" onClick={handleRemoveImage} className="btn-vault">
                  Quitar Imagen
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              className="input-vault"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              className="input-vault"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Precio</label>
              <input
                type="number"
                step="0.01"
                className="input-vault"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                className="input-vault"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Estado del Producto</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="activo"
                  checked={formData.status === 'activo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Activo
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactivo"
                  checked={formData.status === 'inactivo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Inactivo
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-vault">
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-vault-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
