import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  category: string;
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Top 10 Safety Tips for Oil & Gas Equipment Operation',
      excerpt: 'Essential safety guidelines every operator should know when working with heavy equipment.',
      content: 'Full blog content here...',
      image: 'https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Admin',
      date: '2026-03-20',
      status: 'published',
      category: 'Safety',
    },
    {
      id: '2',
      title: 'Understanding BOP Systems: A Complete Guide',
      excerpt: 'Learn everything you need to know about Blowout Preventer systems.',
      content: 'Full blog content here...',
      image: 'https://images.unsplash.com/photo-1765048892515-3bc3557dc980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Admin',
      date: '2026-03-15',
      status: 'published',
      category: 'Technical',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Technical',
    status: 'draft',
  });

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    const post: BlogPost = {
      id: Date.now().toString(),
      title: newPost.title || '',
      excerpt: newPost.excerpt || '',
      content: newPost.content || '',
      image: newPost.image || 'https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      author: 'Admin',
      date: new Date().toISOString().split('T')[0],
      status: newPost.status || 'draft',
      category: newPost.category || 'Technical',
    };
    setPosts([post, ...posts]);
    setShowAddModal(false);
    setNewPost({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      category: 'Technical',
      status: 'draft',
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add Blog Post
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  {post.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {post.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">View</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-2 text-green-500 hover:bg-green-50 rounded-lg transition">
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Blog Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-8 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Blog Post</h2>
            <form onSubmit={handleAddPost} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Enter blog post title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Excerpt *</label>
                <textarea
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Brief description of the blog post"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Full blog post content"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Featured Image URL</label>
                <input
                  type="url"
                  value={newPost.image}
                  onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option>Technical</option>
                    <option>Safety</option>
                    <option>Industry News</option>
                    <option>Maintenance</option>
                    <option>Best Practices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                  <select
                    value={newPost.status}
                    onChange={(e) => setNewPost({ ...newPost, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Add Blog Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
