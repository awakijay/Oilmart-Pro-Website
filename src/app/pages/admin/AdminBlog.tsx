import { useState } from 'react';
import { ImageUp, Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { BlogPost, useAppData } from '../../context/AppDataContext';
import { IMAGE_ACCEPT, imageFileToDataUrl } from '../../utils/imageUpload';

const defaultPost: Partial<BlogPost> = {
  title: '',
  excerpt: '',
  content: '',
  image: '',
  category: 'Technical',
  status: 'draft',
};

export function AdminBlog() {
  const { blogPosts: posts, addBlogPost, updateBlogPost, deleteBlogPost } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formPost, setFormPost] = useState<Partial<BlogPost>>(defaultPost);
  const [imageUploadError, setImageUploadError] = useState('');
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewingPost = posts.find((post) => post.id === viewingPostId) ?? null;
  const editingPost = posts.find((post) => post.id === editingPostId) ?? null;

  const resetForm = () => {
    setShowModal(false);
    setEditingPostId(null);
    setFormPost(defaultPost);
    setImageUploadError('');
    setFormError('');
    setIsSaving(false);
  };

  const getActionErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    try {
      await addBlogPost({
        id: Date.now().toString(),
        title: formPost.title || '',
        excerpt: formPost.excerpt || '',
        content: formPost.content || '',
        image: formPost.image || 'https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        author: 'Admin',
        date: new Date().toISOString().split('T')[0],
        status: formPost.status || 'draft',
        category: formPost.category || 'Technical',
      });
      resetForm();
    } catch (error) {
      setFormError(getActionErrorMessage(error, 'Unable to save blog post. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setFormError('');
    setIsSaving(true);

    try {
      await updateBlogPost(editingPost.id, {
        title: formPost.title || editingPost.title,
        excerpt: formPost.excerpt || editingPost.excerpt,
        content: formPost.content || editingPost.content,
        image: formPost.image || editingPost.image,
        category: formPost.category || editingPost.category,
        status: formPost.status || editingPost.status,
      });
      resetForm();
    } catch (error) {
      setFormError(getActionErrorMessage(error, 'Unable to update blog post. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPostId(post.id);
    setImageUploadError('');
    setFormError('');
    setFormPost(post);
    setShowModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    setActionError('');

    try {
      await deleteBlogPost(postId);
    } catch (error) {
      setActionError(getActionErrorMessage(error, 'Unable to delete blog post. Please try again.'));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImageUploadError('');
      const image = await imageFileToDataUrl(file);
      setFormPost((current) => ({ ...current, image }));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Create and manage content that stays available across admin sessions.</p>
        </div>
        <button onClick={() => { setEditingPostId(null); setFormPost(defaultPost); setImageUploadError(''); setFormError(''); setShowModal(true); }} className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition hover:bg-orange-600">
          <Plus className="w-5 h-5" />
          Add Blog Post
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search blog posts..." className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
        </div>
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{post.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{post.status}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button onClick={() => setViewingPostId(post.id)} className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Eye className="w-4 h-4" /><span className="text-sm">View</span></button>
                <button onClick={() => openEditModal(post)} className="flex-1 flex items-center justify-center gap-2 p-2 text-green-500 hover:bg-green-50 rounded-lg transition"><Edit2 className="w-4 h-4" /><span className="text-sm">Edit</span></button>
                <button onClick={() => handleDeletePost(post.id)} className="flex-1 flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /><span className="text-sm">Delete</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-lg bg-white p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}</h2>
            <form onSubmit={editingPost ? handleUpdatePost : handleAddPost} className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              )}
              <input value={formPost.title} onChange={(e) => setFormPost({ ...formPost, title: e.target.value })} required placeholder="Title" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              <textarea value={formPost.excerpt} onChange={(e) => setFormPost({ ...formPost, excerpt: e.target.value })} required rows={2} placeholder="Excerpt" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              <textarea value={formPost.content} onChange={(e) => setFormPost({ ...formPost, content: e.target.value })} required rows={6} placeholder="Content" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
              <div className="space-y-3">
                <input value={formPost.image} onChange={(e) => setFormPost({ ...formPost, image: e.target.value })} placeholder="Featured Image URL" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600">
                    <ImageUp className="h-5 w-5" />
                    Upload image file
                    <input type="file" accept={IMAGE_ACCEPT} onChange={handleImageUpload} className="sr-only" />
                  </label>
                  {formPost.image && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                      <img src={formPost.image} alt="Selected blog" className="h-12 w-12 rounded object-cover" />
                      <span className="text-sm text-gray-600">{formPost.image.startsWith('data:') ? 'Uploaded image selected' : 'Image URL selected'}</span>
                    </div>
                  )}
                </div>
                {imageUploadError && <p className="text-sm text-red-600">{imageUploadError}</p>}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select value={formPost.category} onChange={(e) => setFormPost({ ...formPost, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
                  <option>Technical</option>
                  <option>Safety</option>
                  <option>Industry News</option>
                  <option>Maintenance</option>
                  <option>Best Practices</option>
                </select>
                <select value={formPost.status} onChange={(e) => setFormPost({ ...formPost, status: e.target.value as 'published' | 'draft' })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button type="button" onClick={resetForm} disabled={isSaving} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:cursor-not-allowed disabled:bg-gray-300">
                  {isSaving ? 'Saving...' : editingPost ? 'Save Changes' : 'Add Blog Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-lg bg-white p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingPost.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{viewingPost.author} • {viewingPost.date}</p>
              </div>
              <button onClick={() => setViewingPostId(null)} className="text-gray-500 hover:text-gray-700 transition">Close</button>
            </div>
            <img src={viewingPost.image} alt={viewingPost.title} className="mb-6 h-48 w-full rounded-lg object-cover sm:h-64" />
            <p className="text-gray-600 mb-4">{viewingPost.excerpt}</p>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingPost.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
