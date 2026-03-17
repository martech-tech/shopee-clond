import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Calendar, User as UserIcon, Share2, Facebook, Twitter, Link as LinkIcon, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  sold_count: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  is_recommended?: number;
  created_at: string;
  updated_at: string;
  recommended_products?: Product[];
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${encodeURIComponent(slug || '')}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
          
          // Update document title for SEO
          if (data.meta_title || data.title) {
            document.title = data.meta_title || data.title;
          }
        }
      } catch (error) {
        console.error("Failed to fetch article", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#059669]"></div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบหน้าบทความที่คุณต้องการ</h1>
      <Link to="/articles" className="text-[#059669] border border-[#059669] px-6 py-2 rounded-sm hover:bg-[#059669] hover:text-white transition-colors">
        กลับไปหน้าบทความทั้งหมด
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-[#059669] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8 flex-1">
              <Link to="/" className="text-3xl font-bold">Shopee</Link>
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link to="/" className="hover:opacity-80 transition-opacity">หน้าแรก</Link>
                <Link to="/articles" className="hover:opacity-80 transition-opacity">บทความ</Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="relative hover:opacity-80 transition-opacity">
                <ShoppingCart size={28} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 py-4 text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-[#059669]">หน้าแรก</Link>
        <ChevronRight size={12} />
        <Link to="/articles" className="hover:text-[#059669]">บทความทั้งหมด</Link>
        <ChevronRight size={12} />
        <span className="text-gray-800 line-clamp-1">{article.title}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <article className="bg-white rounded-sm shadow-sm overflow-hidden">
          {/* Featured Image */}
          <div className="aspect-[21/9] bg-gray-100 overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${article.slug}/1200/600`} 
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-6 md:p-12">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 border-b pb-8">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(article.created_at).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} />
                <span>Admin</span>
              </div>
              {article.is_recommended === 1 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  บทความที่แนะนำในหน้าแรก
                </div>
              )}
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">แชร์:</span>
                <button className="text-gray-400 hover:text-[#1877F2] transition-colors"><Facebook size={18} /></button>
                <button className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter size={18} /></button>
                <button className="text-gray-400 hover:text-[#059669] transition-colors"><LinkIcon size={18} /></button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {article.title}
            </h1>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Recommended Products Section */}
            {article.recommended_products && article.recommended_products.length > 0 && (
              <div className="mt-16 pt-12 border-t">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <ShoppingCart className="text-[#059669]" />
                  สินค้าที่เกี่ยวข้องในบทความนี้
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {article.recommended_products.map(product => (
                    <motion.div 
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="bg-white border rounded-sm overflow-hidden group hover:shadow-md transition-all"
                    >
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs line-clamp-2 h-8 mb-2 font-medium">{product.name}</h4>
                        <div className="text-[#059669] font-bold text-sm">฿{product.price.toLocaleString()}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex text-yellow-400">
                            <Star size={8} fill="currentColor" />
                            <Star size={8} fill="currentColor" />
                            <Star size={8} fill="currentColor" />
                            <Star size={8} fill="currentColor" />
                            <Star size={8} fill="currentColor" />
                          </div>
                          <span className="text-[8px] text-gray-400">ขายแล้ว {product.sold_count}</span>
                        </div>
                        <Link 
                          to="/" 
                          className="block w-full text-center mt-3 py-1 bg-[#059669] text-white text-[10px] font-bold rounded-sm hover:bg-[#047857] transition-colors"
                        >
                          ดูรายละเอียด
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <Link to="/articles" className="text-gray-500 hover:text-[#059669] flex items-center gap-2 text-sm font-medium">
            <ChevronRight className="rotate-180" size={16} />
            กลับไปหน้าบทความ
          </Link>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#059669] text-sm font-medium">
              <Share2 size={16} />
              แชร์บทความนี้
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2026 Shopee Clone. All Rights Reserved.
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .article-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111; }
        .article-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #222; }
        .article-content p { margin-bottom: 1.25rem; }
        .article-content ul, .article-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
        .article-content li { margin-bottom: 0.5rem; }
        .article-content img { border-radius: 0.25rem; margin: 2rem 0; }
        .article-content a { color: #059669; text-decoration: underline; }
      `}} />
    </div>
  );
}
