import { useState } from 'react';
import { ImageUp, Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Product } from '../../context/CartContext';
import { useAppData } from '../../context/AppDataContext';
import { IMAGE_ACCEPT, imageFileToDataUrl } from '../../utils/imageUpload';

const NAIRA = '\u20A6';

const defaultProduct: Partial<Product> = {
  name: '',
  category: 'Well Control',
  price: NAIRA,
  image: '',
  rating: 4.5,
  orders: '0+',
  description: '',
};

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Partial<Product>>(defaultProduct);
  const [imageUploadError, setImageUploadError] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingProduct = products.find((product) => product.id === editingProductId) ?? null;

  const resetForm = () => {
    setShowModal(false);
    setEditingProductId(null);
    setFormProduct(defaultProduct);
    setImageUploadError('');
  };

  const normalizePrice = (value: string) => {
    const digits = value.replace(/[^\d.]/g, '');
    return digits ? `${NAIRA}${digits}` : NAIRA;
  };

  const normalizeRating = (value: unknown, fallback = 4.5) => {
    const parsed = Number(value);
    const rating = Number.isFinite(parsed) ? parsed : fallback;

    return Math.min(5, Math.max(0, Math.round(rating * 10) / 10));
  };

  const selectedRating = normalizeRating(formProduct.rating);

  const updateRating = (value: string) => {
    setFormProduct((current) => ({ ...current, rating: normalizeRating(value) }));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      id: Date.now().toString(),
      name: formProduct.name || '',
      category: formProduct.category || 'Well Control',
      price: formProduct.price && formProduct.price !== NAIRA ? formProduct.price : `${NAIRA}0`,
      image: formProduct.image || 'https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      rating: normalizeRating(formProduct.rating),
      orders: formProduct.orders || '0+',
      description: formProduct.description || '',
      specifications: {},
    });
    resetForm();
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: formProduct.name || editingProduct.name,
      category: formProduct.category || editingProduct.category,
      price: formProduct.price && formProduct.price !== NAIRA ? formProduct.price : editingProduct.price,
      image: formProduct.image || editingProduct.image,
      rating: normalizeRating(formProduct.rating, editingProduct.rating),
      orders: formProduct.orders || editingProduct.orders,
      description: formProduct.description || editingProduct.description,
    });
    resetForm();
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setImageUploadError('');
    setFormProduct({
      name: product.name,
      category: product.category,
      price: product.price.startsWith(NAIRA) ? product.price : normalizePrice(product.price),
      image: product.image,
      rating: product.rating,
      orders: product.orders,
      description: product.description,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImageUploadError('');
      const image = await imageFileToDataUrl(file);
      setFormProduct((current) => ({ ...current, image }));
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'Unable to upload image.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
          <p className="text-gray-600">Manage your equipment catalog and publish updates live to the website.</p>
        </div>
        <button
          onClick={() => {
            setEditingProductId(null);
            setFormProduct(defaultProduct);
            setImageUploadError('');
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition hover:bg-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">ID: {product.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{product.rating}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form className="space-y-4" onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
              <input value={formProduct.name} onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })} placeholder="Product name" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              <select value={formProduct.category} onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
                <option>Well Control</option>
                <option>Drilling Equipment</option>
                <option>Production Equipment</option>
                <option>Completion Tools</option>
                <option>Pumps & Valves</option>
                <option>Safety Equipment</option>
                <option>Testing Equipment</option>
                <option>Vessels</option>
              </select>
              <input
                value={formProduct.price}
                onChange={(e) => setFormProduct({ ...formProduct, price: normalizePrice(e.target.value) })}
                placeholder={`${NAIRA}0`}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <div className="rounded-lg border-2 border-gray-300 p-4 focus-within:border-orange-500">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-gray-900">Rating</label>
                  <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    {selectedRating.toFixed(1)}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={selectedRating}
                    onChange={(e) => updateRating(e.target.value)}
                    className="w-full accent-orange-500"
                    aria-label="Product rating"
                  />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={selectedRating}
                    onChange={(e) => updateRating(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 focus:border-orange-500 focus:outline-none sm:w-24"
                    aria-label="Product rating value"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <input value={formProduct.image} onChange={(e) => setFormProduct({ ...formProduct, image: e.target.value })} placeholder="Image URL" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600">
                    <ImageUp className="h-5 w-5" />
                    Upload image file
                    <input type="file" accept={IMAGE_ACCEPT} onChange={handleImageUpload} className="sr-only" />
                  </label>
                  {formProduct.image && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                      <ImageWithFallback src={formProduct.image} alt="Selected product" className="h-12 w-12 rounded object-cover" />
                      <span className="text-sm text-gray-600">{formProduct.image.startsWith('data:') ? 'Uploaded image selected' : 'Image URL selected'}</span>
                    </div>
                  )}
                </div>
                {imageUploadError && <p className="text-sm text-red-600">{imageUploadError}</p>}
              </div>
              <textarea value={formProduct.description} onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })} placeholder="Description" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              <div className="flex flex-col gap-4 sm:flex-row">
                <button type="button" onClick={resetForm} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
