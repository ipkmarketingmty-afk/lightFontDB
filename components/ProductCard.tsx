'use client'

interface ProductCardProps {
  product: {
    id: number
    name: string
    description: string
    price: number
    stock: number
    status: string
    image: string | null
  }
  onEdit: () => void
  onDelete: () => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="card-vault group hover:border-vault-navy-hover transition-all">
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            product.status === 'activo' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {product.status === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      
      <h3 className="font-semibold text-lg mb-2 truncate text-vault-navy">{product.name}</h3>
      
      {product.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-vault-navy">${product.price.toFixed(2)}</span>
        <span className={`text-sm px-3 py-1 rounded-full border-2 ${
          product.stock > 10 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : product.stock > 0 
            ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          Stock: {product.stock}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 btn-vault text-sm"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-white border-2 border-red-500 text-red-600 rounded-lg px-4 py-2 hover:bg-red-500 hover:text-white transition-all text-sm font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
