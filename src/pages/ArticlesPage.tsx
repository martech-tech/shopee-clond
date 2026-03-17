import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, ChevronRight, Calendar, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_recommended?: number;
  created_at: string;
  updated_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          setArticles(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch articles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ee4d2d]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-[#ee4d2d] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8 flex-1">
              <Link to="/" className="text-3xl font-bold">Shopee</Link>
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link to="/" className="hover:opacity-80 transition-opacity">หน้าแรก</Link>
                <Link to="/articles" className="opacity-100 border-b-2 border-white pb-1">บทความ</Link>
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
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-[#ee4d2d]">หน้าแรก</Link>
        <ChevronRight size={12} />
        <span className="text-gray-800">บทความทั้งหมด</span>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">บทความและสาระน่ารู้</h1>
          <p className="text-gray-600 max-w-2xl">ติดตามเทรนด์ใหม่ๆ เคล็ดลับการช้อปปิ้ง และรีวิวสินค้าที่น่าสนใจได้ที่นี่</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-sm shadow-sm">
            <p className="text-gray-400">ยังไม่มีบทความในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <motion.div 
                key={article.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-sm shadow-sm overflow-hidden flex flex-col group"
              >
                <Link to={`/articles/${article.slug}`} className="block aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${article.slug}/600/400`} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(article.created_at).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon size={14} />
                      Admin
                    </span>
                    {article.is_recommended === 1 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">บทความที่แนะนำในหน้าแรก</span>
                    )}
                  </div>
                  <Link to={`/articles/${article.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#ee4d2d] transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                  </p>
                  <Link 
                    to={`/articles/${article.slug}`}
                    className="text-[#ee4d2d] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    อ่านต่อ <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400">
          © 2026 Shopee Clone. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
