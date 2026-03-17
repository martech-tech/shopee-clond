import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronRight, 
  Star, 
  Tag, 
  X,
  Trash2,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string;
  stock: number;
  sold_count: number;
  category_id: number;
  category_name?: string;
}

interface Category {
  id: number;
  name: string;
  promo_image?: string;
  headline?: string;
}

interface Promotion {
  id: number;
  name: string;
  discount_percent: number;
  active: number;
  product_id?: number;
}

interface FlashSale {
  id: number;
  name: string;
  time_slot: string;
  date: string;
  items: any[];
}

interface Discount {
  id: number;
  name: string;
  type: string;
  value: number;
  items: any[];
}

interface Coupon {
  id: number;
  name: string;
  code: string;
  value: number;
  type: string;
  min_spend: number;
}

interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  active: number;
}

interface CartItem extends Product {
  quantity: number;
}

const ProductCard: React.FC<{ product: Product, onAddToCart: (p: Product) => void }> = ({ product, onAddToCart }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-sm shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-[#059669] group"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
            สินค้าหมด
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm line-clamp-2 h-10 mb-2 leading-relaxed">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[#059669] text-lg font-medium">฿{product.price.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400">ขายแล้ว {product.sold_count >= 1000 ? (product.sold_count/1000).toFixed(1) + 'พัน' : product.sold_count}</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
          </div>
          <span className="text-[10px] text-gray-400">(4.9)</span>
        </div>
        <button 
          disabled={product.stock === 0}
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          className={`w-full mt-3 py-1.5 border border-[#059669] text-[#059669] text-sm rounded-sm transition-colors ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#059669] hover:text-white'}`}
        >
          {product.stock === 0 ? 'สินค้าหมด' : 'เพิ่มไปยังรถเข็น'}
        </button>
      </div>
    </motion.div>
  );
};

export default function UserHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [articles, setArticles] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, prRes, adsRes, configRes, articlesRes, fsRes, dRes, coRes, recArtRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/promotions'),
          fetch('/api/ads'),
          fetch('/api/site-config'),
          fetch('/api/articles'),
          fetch('/api/flash-sales'),
          fetch('/api/discounts'),
          fetch('/api/coupons'),
          fetch('/api/articles?recommended=true')
        ]);
        
        if (!pRes.ok || !cRes.ok || !prRes.ok || !adsRes.ok || !configRes.ok) {
          throw new Error("One or more API requests failed");
        }

        setProducts(await pRes.json());
        setCategories(await cRes.json());
        setPromotions(await prRes.json());
        setAds(await adsRes.json());
        setSiteConfig(await configRes.json());
        if (articlesRes.ok) setArticles(await articlesRes.json());
        if (fsRes.ok) setFlashSales(await fsRes.json());
        if (dRes.ok) setDiscounts(await dRes.json());
        if (coRes.ok) setCoupons(await coRes.json());
        if (recArtRes.ok) setRecommendedArticles(await recArtRes.json());
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId ? product.category_id === selectedCategoryId : true;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total_amount: totalAmount
        })
      });
      if (response.ok) {
        alert('สั่งซื้อสินค้าสำเร็จ! ขอบคุณที่ใช้บริการ');
        setCart([]);
        setIsCartOpen(false);
      }
    } catch (error) {
      console.error("Checkout failed", error);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#059669]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-gray-800">
      <nav className="bg-[#059669] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-8 flex-1">
              <Link to="/" className="text-3xl font-bold">Shopee</Link>
              <div className="flex items-center gap-6 text-sm font-medium">
                <Link to="/" className="hover:opacity-80 transition-opacity">หน้าแรก</Link>
                <Link to="/articles" className="hover:opacity-80 transition-opacity">บทความ</Link>
              </div>
              <div className="flex-1 max-w-2xl relative">
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้าที่คุณต้องการ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-4 pr-12 rounded-sm text-black focus:outline-none"
                />
                <button className="absolute right-1 top-1 bottom-1 px-4 bg-[#059669] rounded-sm hover:bg-[#047857] transition-colors">
                  <Search size={20} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setIsCartOpen(true)} className="relative hover:opacity-80 transition-opacity">
                <ShoppingCart size={28} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#059669] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-[#059669]">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. ADS ของ webside ที่อยากโชว์ */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Main Hero - Event Category */}
          <Link 
            to={categories.find(c => c.name === 'Event') ? `/category/${categories.find(c => c.name === 'Event')?.id}` : '#'}
            className="md:col-span-2 h-64 bg-gradient-to-r from-[#059669] to-[#34d399] rounded-sm overflow-hidden relative group cursor-pointer shadow-sm"
          >
            <div className="absolute inset-0 flex flex-col justify-center p-12 text-white z-10">
              <h2 className="text-4xl font-bold mb-4">
                {categories.find(c => c.name === 'Event')?.headline || categories.find(c => c.name === 'Event')?.name || 'Event'}
              </h2>
              <p className="text-xl opacity-90 mb-6">
                {categories.find(c => c.name === 'Event')?.name === 'Event' ? 'กิจกรรมพิเศษสำหรับคุณ' : 'พบกับโปรโมชั่นสุดพิเศษ'}
              </p>
              <button className="bg-white text-[#059669] px-8 py-2 rounded-sm font-bold w-fit hover:bg-gray-100 transition-colors">
                ดูรายละเอียด
              </button>
            </div>
            <img 
              src={categories.find(c => c.name === 'Event')?.promo_image || siteConfig.hero_image || "https://picsum.photos/seed/shopping/800/400"} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </Link>

          <div className="flex flex-col gap-2">
            {/* Side Banner 1 - สินค้าใหม่ Category */}
            <Link 
              to={categories.find(c => c.name === 'สินค้าใหม่') ? `/category/${categories.find(c => c.name === 'สินค้าใหม่')?.id}` : '#'}
              className="h-[126px] bg-gray-200 rounded-sm overflow-hidden relative cursor-pointer shadow-sm group"
            >
              <img 
                src={categories.find(c => c.name === 'สินค้าใหม่')?.promo_image || "https://picsum.photos/seed/new/400/200"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex flex-col items-center justify-center text-white p-2 text-center">
                <div className="font-bold text-lg drop-shadow-md">{categories.find(c => c.name === 'สินค้าใหม่')?.name || 'สินค้าใหม่'}</div>
                <div className="text-[10px] opacity-90">{categories.find(c => c.name === 'สินค้าใหม่')?.headline}</div>
              </div>
            </Link>

            {/* Side Banner 2 - Course แนะนำ Category or other Ads */}
            {categories.find(c => c.name === 'Course แนะนำ') ? (
              <Link 
                to={`/category/${categories.find(c => c.name === 'Course แนะนำ')?.id}`}
                className="h-[126px] bg-gray-200 rounded-sm overflow-hidden relative cursor-pointer shadow-sm group"
              >
                <img 
                  src={categories.find(c => c.name === 'Course แนะนำ')?.promo_image || "https://picsum.photos/seed/course/400/200"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex flex-col items-center justify-center text-white p-2 text-center">
                  <div className="font-bold text-lg drop-shadow-md">{categories.find(c => c.name === 'Course แนะนำ')?.name}</div>
                  <div className="text-[10px] opacity-90">{categories.find(c => c.name === 'Course แนะนำ')?.headline}</div>
                </div>
              </Link>
            ) : (
              ads.filter(ad => ad.active && ad.position === 'home_top').slice(0, 1).map((ad) => (
                <Link key={ad.id} to={ad.link_url || '#'} className="h-[126px] bg-gray-200 rounded-sm overflow-hidden relative cursor-pointer shadow-sm group">
                  <img src={ad.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center text-white font-bold text-xl drop-shadow-md">
                    {ad.title}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 2. Promotion ของ platform ที่มีเแบ่งเป็น 2 Row 2 column (Flashsale และ ส่วนลดสินค้า) */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-gray-800 font-bold text-xl">โปรโมชั่นพิเศษ</h2>
            <Link to="/" className="text-[#059669] text-sm flex items-center gap-1">ดูโปรโมชั่นทั้งหมด <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y md:divide-y-0">
            {/* Row 1, Col 1 & 2: Flash Sale */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#059669] font-black text-lg italic uppercase italic">Flash Sale</h3>
                  <div className="flex gap-1">
                    <span className="bg-black text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold">02</span>
                    <span className="font-bold text-xs">:</span>
                    <span className="bg-black text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold">45</span>
                    <span className="font-bold text-xs">:</span>
                    <span className="bg-black text-white px-1.5 py-0.5 rounded-sm text-[10px] font-bold">12</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {flashSales.length > 0 && flashSales[0].items.length > 0 ? flashSales[0].items.slice(0, 2).map((item: any) => (
                  <div key={item.id} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-full aspect-square relative mb-2 bg-gray-50 rounded-sm overflow-hidden">
                      <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                      <div className="absolute top-0 right-0 bg-yellow-400 text-[#059669] text-[10px] font-bold px-1.5 py-0.5">
                        -{Math.round((1 - item.flash_price / 1000) * 100)}%
                      </div>
                    </div>
                    <div className="text-[#059669] font-bold text-sm">฿{item.flash_price.toLocaleString()}</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#059669]" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-gray-400 text-xs italic">ไม่มี Flash Sale</div>
                )}
              </div>
            </div>

            {/* Row 2, Col 1 & 2: Product Discounts */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 font-bold text-lg">ส่วนลดสินค้า</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {discounts.length > 0 ? discounts.slice(0, 2).map((d: any) => (
                  <div key={d.id} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-full aspect-square bg-gray-50 rounded-sm flex items-center justify-center mb-2 overflow-hidden relative">
                      {d.items && d.items[0] ? (
                        <img src={products.find(p => p.id === d.items[0].product_id)?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <Percent size={40} className="text-emerald-200" />
                      )}
                      <div className="absolute top-0 left-0 bg-[#059669] text-white text-[10px] font-bold px-1.5 py-0.5">
                        HOT
                      </div>
                    </div>
                    <div className="text-gray-800 font-bold text-xs line-clamp-1 text-center w-full">{d.name}</div>
                    <div className="text-[#059669] font-bold text-sm">ลด {d.type === 'percent' ? `${d.value}%` : `฿${d.value}`}</div>
                  </div>
                )) : (
                  <div className="col-span-2 py-10 text-center text-gray-400 text-xs italic">ไม่มีส่วนลดสินค้า</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. โค้ดส่วนลดที่สามารถใช้ได้ */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white p-4 rounded-sm shadow-sm">
          <h2 className="text-gray-500 uppercase text-sm font-medium tracking-wider mb-4">โค้ดส่วนลดแนะนำ</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {coupons.length > 0 ? coupons.map(coupon => (
              <div key={coupon.id} className="flex-shrink-0 bg-white border border-[#059669]/20 px-6 py-4 rounded-sm flex items-center gap-4 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#059669]"></div>
                <div className="bg-[#059669] text-white p-2 rounded-md">
                  <Tag size={24} />
                </div>
                <div>
                  <div className="font-bold text-[#059669]">{coupon.name}</div>
                  <div className="text-xs text-gray-500">ลด {coupon.type === 'percent' ? `${coupon.value}%` : `฿${coupon.value}`} (ขั้นต่ำ ฿{coupon.min_spend})</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1 uppercase">Code: {coupon.code}</div>
                </div>
                <button className="bg-[#059669] text-white px-4 py-1 rounded-sm text-xs font-bold hover:bg-[#047857] transition-colors">เก็บโค้ด</button>
              </div>
            )) : (
              <div className="w-full py-6 text-center text-gray-400 text-sm italic">ไม่มีโค้ดส่วนลดในขณะนี้</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. หมวดหมูสินค้า */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-sm shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-gray-500 uppercase text-sm font-medium tracking-wider">หมวดหมู่</h2>
            {selectedCategoryId && (
              <button 
                onClick={() => setSelectedCategoryId(null)}
                className="text-[#059669] text-sm font-bold"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 divide-x divide-y">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`p-4 flex flex-col items-center gap-2 hover:bg-gray-50 cursor-pointer transition-colors ${selectedCategoryId === cat.id ? 'bg-[#059669]/5 ring-1 ring-inset ring-[#059669]' : ''}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${selectedCategoryId === cat.id ? 'bg-[#059669] text-white' : 'bg-gray-100 text-[#059669]'}`}>
                  {cat.name[0]}
                </div>
                <span className={`text-xs text-center font-medium ${selectedCategoryId === cat.id ? 'text-[#059669]' : 'text-gray-600'}`}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. สินค้าแนะนำสำหรับคุณ */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium border-b-4 border-[#059669] pb-1">
            {selectedCategoryId 
              ? `สินค้าในหมวดหมู่: ${categories.find(c => c.id === selectedCategoryId)?.name}` 
              : searchQuery 
                ? `ผลการค้นหาสำหรับ: "${searchQuery}"`
                : 'สินค้าแนะนำสำหรับคุณ'
            }
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">ไม่พบสินค้าที่คุณต้องการ</p>
            <button 
              onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); }}
              className="mt-4 text-[#059669] underline"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* 6. บทความที่แนะนำ สูงสุด 5 slot ที่โชว์แบบ defalt หากดูเพิ่มให้คลิกดูเพิ่มเติม */}
      <div className="max-w-7xl mx-auto px-4 mt-16 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 border-b-4 border-[#059669] pb-1">บทความแนะนำ</h2>
          <Link to="/articles" className="text-[#059669] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            ดูบทความทั้งหมด <ChevronRight size={16} />
          </Link>
        </div>
        
        {recommendedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {recommendedArticles.slice(0, 5).map(article => (
              <Link key={article.id} to={`/articles/${article.slug}`} className="bg-white rounded-sm shadow-sm overflow-hidden group flex flex-col">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={article.thumbnail_url || `https://picsum.photos/seed/${article.slug}/400/225`} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  {article.is_recommended === 1 && (
                    <div className="text-[9px] font-bold text-emerald-600 mb-1">บทความที่แนะนำในหน้าแรก</div>
                  )}
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-[#059669] transition-colors">{article.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-4 flex-1">{article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 60)}</p>
                  <div className="flex items-center justify-between text-[9px] text-gray-400 mt-auto pt-2 border-t">
                    <span>{new Date(article.created_at).toLocaleDateString('th-TH')}</span>
                    <span className="text-[#059669] font-bold">อ่านต่อ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm italic bg-white rounded-sm shadow-sm">
            ไม่มีบทความแนะนำในขณะนี้
          </div>
        )}
        
        {recommendedArticles.length > 5 && (
          <div className="mt-8 text-center">
            <Link to="/articles" className="inline-flex items-center gap-2 px-8 py-2 border border-[#059669] text-[#059669] font-bold rounded-sm hover:bg-[#059669] hover:text-white transition-all">
              ดูบทความเพิ่มเติม
            </Link>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-[70]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="text-[#059669]" />
                  รถเข็นของฉัน ({cart.length})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <ShoppingCart size={64} strokeWidth={1} />
                    <p>รถเข็นของคุณยังว่างอยู่</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-[#059669] border border-[#059669] px-6 py-2 rounded-sm"
                    >
                      ไปช้อปเลย
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-md border">
                      <img src={item.image_url} className="w-20 h-20 object-cover rounded-md bg-white" referrerPolicy="no-referrer" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                        <div className="text-[#059669] font-bold mt-1">฿{item.price.toLocaleString()}</div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border rounded-sm bg-white">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="px-2 py-1 hover:bg-gray-100 border-r">-</button>
                            <span className="px-4 py-1 text-sm">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="px-2 py-1 hover:bg-gray-100 border-l">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">ยอดรวมทั้งหมด</span>
                    <span className="text-2xl font-bold text-[#059669]">฿{totalAmount.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#059669] text-white py-4 rounded-sm font-bold text-lg hover:bg-[#047857] transition-colors shadow-lg shadow-[#059669]/20"
                  >
                    ชำระเงิน
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs text-gray-500">ศูนย์ช่วยเหลือ</h4>
            <ul className="text-xs space-y-2 text-gray-600">
              <li>Help Centre</li>
              <li>Shopee Blog</li>
              <li>Shopee Mall</li>
              <li>How to Buy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs text-gray-500">เกี่ยวกับ SHOPEE</h4>
            <ul className="text-xs space-y-2 text-gray-600">
              <li>About Us</li>
              <li>Shopee Careers</li>
              <li>Shopee Policies</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs text-gray-500">การชำระเงิน</h4>
            <div className="flex gap-2 flex-wrap">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold">MASTER</div>
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[8px] font-bold">PROMPT</div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs text-gray-500">ติดตามเรา</h4>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-gray-400">
          © 2026 Shopee Clone. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
