import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  X,
  Package,
  Tag,
  LogOut,
  Search,
  Upload,
  ChevronRight,
  Clock,
  Ticket,
  Percent,
  ShoppingBag,
  CheckCircle,
  Truck,
  CreditCard,
  XCircle,
  RefreshCcw,
  Image as ImageIcon,
  Users,
  Monitor,
  Megaphone,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

// --- Types ---
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  images: string; // JSON string
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

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: any[];
}

interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  active: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  thumbnail_url: string;
  is_recommended?: number;
  updated_at: string;
  products?: Product[];
}

type AdminTab = 'dashboard' | 'products' | 'categories' | 'marketing' | 'orders' | 'flash-sale' | 'discount' | 'coupon' | 'target-audience' | 'ads' | 'content' | 'articles';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [isEditingCategory, setIsEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryPromo, setNewCategoryPromo] = useState('');
  const [newCategoryHeadline, setNewCategoryHeadline] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);

  // Marketing states
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<any[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [isEditingAd, setIsEditingAd] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditingArticle, setIsEditingArticle] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [pRes, cRes, oRes, fsRes, dRes, coRes, taRes, adsRes, configRes, articlesRes] = await Promise.all([
        fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/flash-sales'),
        fetch('/api/discounts'),
        fetch('/api/coupons'),
        fetch('/api/target-audiences'),
        fetch('/api/ads'),
        fetch('/api/site-config'),
        fetch('/api/articles')
      ]);

      if (!pRes.ok || !cRes.ok || !oRes.ok || !fsRes.ok || !dRes.ok || !coRes.ok || !taRes.ok || !adsRes.ok || !configRes.ok || !articlesRes.ok) {
        throw new Error("One or more API requests failed");
      }

      setProducts(await pRes.json());
      setCategories(await cRes.json());
      setOrders(await oRes.json());
      setFlashSales(await fsRes.json());
      setDiscounts(await dRes.json());
      setCoupons(await coRes.json());
      setTargetAudiences(await taRes.json());
      setAds(await adsRes.json());
      setSiteConfig(await configRes.json());
      setArticles(await articlesRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number | 'primary') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (index === 'primary') {
        setIsEditing({ ...isEditing, image_url: base64 });
      } else {
        const currentImages = JSON.parse(isEditing.images || '[]');
        currentImages[index] = base64;
        setIsEditing({ ...isEditing, images: JSON.stringify(currentImages) });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = isEditing?.id ? 'PUT' : 'POST';
    const url = isEditing?.id ? `/api/products/${isEditing.id}` : '/api/products';

    const payload = {
      ...data,
      price: parseFloat(data.price as string),
      stock: parseInt(data.stock as string),
      sold_count: parseInt(data.sold_count as string) || 0,
      category_id: parseInt(data.category_id as string),
      image_url: isEditing.image_url,
      images: JSON.parse(isEditing.images || '[]')
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsEditing(null);
    fetchData();
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    const method = isEditingCategory?.id ? 'PUT' : 'POST';
    const url = isEditingCategory?.id ? `/api/categories/${isEditingCategory.id}` : '/api/categories';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: newCategory,
        promo_image: newCategoryPromo,
        headline: newCategoryHeadline
      })
    });
    setNewCategory('');
    setNewCategoryPromo('');
    setNewCategoryHeadline('');
    setIsEditingCategory(null);
    setShowCatModal(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? สินค้าในหมวดหมู่นี้จะถูกย้ายไปที่ "ไม่มีหมวดหมู่"')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const renderSidebarItem = (id: AdminTab, icon: any, label: string) => (
    <button 
      onClick={() => { setActiveTab(id); setIsEditing(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === id || (id === 'marketing' && ['flash-sale', 'discount', 'coupon'].includes(activeTab)) ? 'bg-[#ee4d2d] text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  const [isCreatingFlashSale, setIsCreatingFlashSale] = useState(false);
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const handleCreateFlashSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      name: data.name,
      time_slot: data.time_slot,
      date: data.date,
      items: selectedProducts.map(id => ({
        product_id: id,
        flash_price: parseFloat(data[`price_${id}`] as string),
        quantity: parseInt(data[`qty_${id}`] as string)
      }))
    };

    await fetch('/api/flash-sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsCreatingFlashSale(false);
    setSelectedProducts([]);
    fetchData();
  };

  const handleCreateDiscount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      name: data.name,
      start_time: data.start_time,
      end_time: data.end_time,
      type: data.type,
      value: parseFloat(data.value as string),
      target_audience: data.target_audience,
      items: selectedProducts
    };

    await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsCreatingDiscount(false);
    setSelectedProducts([]);
    fetchData();
  };

  const handleCreateCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const payload = {
      name: data.name,
      code: data.code,
      start_time: data.start_time,
      end_time: data.end_time,
      type: data.type,
      value: parseFloat(data.value as string),
      min_spend: parseFloat(data.min_spend as string) || 0,
      target_audience: data.target_audience,
      items: selectedProducts
    };

    await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsCreatingCoupon(false);
    setSelectedProducts([]);
    fetchData();
  };

  const handleSaveAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const method = isEditingAd?.id ? 'PUT' : 'POST';
    const url = isEditingAd?.id ? `/api/ads/${isEditingAd.id}` : '/api/ads';

    const payload = {
      ...data,
      image_url: isEditingAd.image_url,
      active: data.active === 'on' ? 1 : 0
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setIsEditingAd(null);
    fetchData();
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโฆษณานี้?')) return;
    await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveSiteConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert('บันทึกการตั้งค่าหน้าเว็บเรียบร้อยแล้ว');
    fetchData();
  };

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setIsEditingAd({ ...isEditingAd, image_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleConfigImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSiteConfig({ ...siteConfig, [key]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ee4d2d]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-[#ee4d2d] p-2 rounded-xl text-white shadow-lg shadow-[#ee4d2d]/30">
            <ShoppingBag size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Seller Centre</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 mt-4">Main</div>
          {renderSidebarItem('products', <Package size={20} />, 'จัดการสินค้า')}
          {renderSidebarItem('categories', <LayoutDashboard size={20} />, 'หมวดหมู่สินค้า')}
          {renderSidebarItem('orders', <CreditCard size={20} />, 'จัดการคำสั่งซื้อ')}
          {renderSidebarItem('target-audience', <Users size={20} />, 'กลุ่มเป้าหมาย')}
          
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 mt-6">Marketing & CMS</div>
          {renderSidebarItem('marketing', <Tag size={20} />, 'Marketing Centre')}
          {renderSidebarItem('ads', <Megaphone size={20} />, 'จัดการโฆษณา')}
          {renderSidebarItem('content', <Monitor size={20} />, 'จัดการหน้าเว็บ')}
          {renderSidebarItem('articles', <FileText size={20} />, 'จัดการบทความ')}
          
          {(activeTab === 'marketing' || ['flash-sale', 'discount', 'coupon'].includes(activeTab)) && (
            <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-2">
              <button onClick={() => setActiveTab('flash-sale')} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'flash-sale' ? 'text-[#ee4d2d] font-bold' : 'text-gray-500 hover:text-black'}`}>Flash Sale</button>
              <button onClick={() => setActiveTab('discount')} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'discount' ? 'text-[#ee4d2d] font-bold' : 'text-gray-500 hover:text-black'}`}>ส่วนลด</button>
              <button onClick={() => setActiveTab('coupon')} className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === 'coupon' ? 'text-[#ee4d2d] font-bold' : 'text-gray-500 hover:text-black'}`}>คูปอง</button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">กลับสู่หน้าหลัก</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-6 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'products' && 'จัดการสินค้า'}
              {activeTab === 'categories' && 'หมวดหมู่สินค้า'}
              {activeTab === 'orders' && 'จัดการคำสั่งซื้อ'}
              {activeTab === 'marketing' && 'Marketing Centre'}
              {activeTab === 'flash-sale' && 'Flash Sale ในร้านค้า'}
              {activeTab === 'discount' && 'ส่วนลดสินค้า'}
              {activeTab === 'coupon' && 'โค้ดส่วนลด'}
              {activeTab === 'target-audience' && 'จัดการกลุ่มเป้าหมาย'}
              {activeTab === 'ads' && 'จัดการโฆษณา'}
              {activeTab === 'content' && 'จัดการหน้าเว็บ'}
              {activeTab === 'articles' && 'จัดการบทความ'}
            </h2>
            <div className="text-xs text-gray-400 mt-1">ยินดีต้อนรับกลับมา, jknowledgeshop</div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'products' && !isEditing && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อสินค้า..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#ee4d2d] rounded-full text-sm outline-none transition-all w-48"
                  />
                </div>
                <select 
                  value={selectedFilterCategory || ''} 
                  onChange={(e) => setSelectedFilterCategory(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#ee4d2d] rounded-full text-sm outline-none transition-all"
                >
                  <option value="">ทุกหมวดหมู่</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            
            {activeTab === 'products' && !isEditing && (
              <button 
                onClick={() => setIsEditing({ images: '[]' })}
                className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#f05d40] transition-all shadow-lg shadow-[#ee4d2d]/20 active:scale-95"
              >
                <Plus size={20} /> เพิ่มสินค้าใหม่
              </button>
            )}

            {activeTab === 'categories' && (
              <button 
                onClick={() => { 
                  setIsEditingCategory(null); 
                  setNewCategory(''); 
                  setNewCategoryPromo('');
                  setNewCategoryHeadline('');
                  setShowCatModal(true); 
                }}
                className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#f05d40] transition-all shadow-lg shadow-[#ee4d2d]/20 active:scale-95"
              >
                <Plus size={20} /> เพิ่มหมวดหมู่ใหม่
              </button>
            )}

            {activeTab === 'ads' && !isEditingAd && (
              <button 
                onClick={() => setIsEditingAd({ active: 1, position: 'home_top' })}
                className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#f05d40] transition-all shadow-lg shadow-[#ee4d2d]/20 active:scale-95"
              >
                <Plus size={20} /> เพิ่มโฆษณาใหม่
              </button>
            )}

            {activeTab === 'articles' && !isEditingArticle && (
              <button 
                onClick={() => setIsEditingArticle({ title: '', slug: '', content: '', meta_title: '', meta_description: '', thumbnail_url: '', product_ids: [] })}
                className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-[#f05d40] transition-all shadow-lg shadow-[#ee4d2d]/20 active:scale-95"
              >
                <Plus size={20} /> เขียนบทความใหม่
              </button>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Product Management */}
          {activeTab === 'products' && (
            isEditing ? (
              <motion.div 
                key={isEditing.id ? `edit-${isEditing.id}` : `new-${isEditing.category_id || 'none'}`}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-100"
              >
                <button onClick={() => setIsEditing(null)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                  <ArrowLeft size={20} /> กลับสู่รายการสินค้า
                </button>
                
                <form onSubmit={handleSaveProduct} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อสินค้า</label>
                        <input name="name" defaultValue={isEditing.name} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" placeholder="ระบุชื่อสินค้า..." />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียดสินค้า</label>
                        <textarea name="description" defaultValue={isEditing.description} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all h-40" placeholder="ระบุรายละเอียด..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">ราคา (บาท)</label>
                          <input name="price" type="number" step="0.01" defaultValue={isEditing.price} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">จำนวนสต็อก</label>
                          <input name="stock" type="number" defaultValue={isEditing.stock} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">หมวดหมู่</label>
                          <div className="flex gap-2">
                            <select name="category_id" defaultValue={isEditing.category_id} className="flex-1 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all">
                              <option value="">เลือกหมวดหมู่</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button type="button" onClick={() => setShowCatModal(true)} className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">จำนวนที่ขายได้</label>
                          <input name="sold_count" type="number" defaultValue={isEditing.sold_count} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพสินค้า (สูงสุด 9 ภาพ)</label>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Primary Image */}
                        <div className="relative aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                          {isEditing.image_url ? (
                            <>
                              <img src={isEditing.image_url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer p-2 bg-white rounded-full"><Upload size={16} /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'primary')} /></label>
                              </div>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-[#ee4d2d] transition-colors">
                              <Upload size={24} />
                              <span className="text-[10px] mt-1 font-bold">ภาพหลัก</span>
                              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'primary')} />
                            </label>
                          )}
                        </div>

                        {/* Additional Images */}
                        {[...Array(8)].map((_, i) => {
                          const imgs = JSON.parse(isEditing.images || '[]');
                          return (
                            <div key={i} className="relative aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group">
                              {imgs[i] ? (
                                <>
                                  <img src={imgs[i]} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer p-2 bg-white rounded-full"><Upload size={16} /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, i)} /></label>
                                  </div>
                                </>
                              ) : (
                                <label className="cursor-pointer flex flex-col items-center text-gray-400 hover:text-[#ee4d2d] transition-colors">
                                  <Plus size={20} />
                                  <span className="text-[10px] mt-1 font-bold">ภาพ {i+2}</span>
                                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, i)} />
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400 italic">* รองรับไฟล์ภาพจากเครื่องคอมพิวเตอร์ของคุณ</p>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#f05d40] transition-all shadow-xl shadow-[#ee4d2d]/20 active:scale-[0.98]">
                    บันทึกข้อมูลสินค้า
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">สินค้า</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ราคา</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">สต็อก</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ขายแล้ว</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products
                      .filter(p => !selectedFilterCategory || p.category_id === selectedFilterCategory)
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(product => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                              <img src={product.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 line-clamp-1">{product.name}</div>
                              <div className="text-[10px] text-[#ee4d2d] font-bold bg-[#ee4d2d]/5 px-2 py-0.5 rounded-full w-fit mt-1">{product.category_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-gray-700">฿{product.price.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-medium text-gray-500">{product.sold_count}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setIsEditing(product)} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                              <Edit size={20} />
                            </button>
                            <button onClick={async () => { if(confirm('ลบสินค้านี้?')) { await fetch(`/api/products/${product.id}`, { method: 'DELETE' }); fetchData(); } }} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="p-24 text-center text-gray-300">
                    <Package size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">ไม่พบสินค้าที่ค้นหา</p>
                  </div>
                )}
              </div>
            )
          )}

          {/* Category Management */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ชื่อหมวดหมู่</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">จำนวนสินค้า</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(category => {
                    const productCount = products.filter(p => p.category_id === category.id).length;
                    return (
                      <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            {category.promo_image && (
                              <img src={category.promo_image} className="w-10 h-6 object-cover rounded bg-gray-100" />
                            )}
                            <div>
                              <div className="font-bold text-gray-800">{category.name}</div>
                              {category.headline && <div className="text-[10px] text-gray-400">{category.headline}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-gray-500">{productCount} รายการ</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setActiveTab('products');
                                setIsEditing({ images: '[]', category_id: category.id });
                              }}
                              className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                              title="เพิ่มสินค้าในหมวดหมู่นี้"
                            >
                              <Plus size={16} /> สินค้า
                            </button>
                            <button 
                              onClick={() => { 
                                setIsEditingCategory(category); 
                                setNewCategory(category.name); 
                                setNewCategoryPromo(category.promo_image || '');
                                setNewCategoryHeadline(category.headline || '');
                                setShowCatModal(true); 
                              }}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Marketing Centre */}
          {activeTab === 'marketing' && (
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Tag className="text-[#ee4d2d]" size={20} /> เครื่องมือส่งเสริมการขาย
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'discount', icon: <Percent size={24} />, title: 'ส่วนลด', desc: 'ตั้งโปรโมชันส่วนลดให้กับสินค้าที่ต้องการเพิ่มยอดขาย', color: 'bg-orange-500' },
                    { id: 'flash-sale', icon: <Clock size={24} />, title: 'Flash Sale ในร้านค้า', desc: 'เพิ่มยอดขายสินค้าโดยจัดโปรโมชันส่วนลดแบบจำกัดเวลาในร้านค้าของคุณ', color: 'bg-red-500' },
                    { id: 'coupon', icon: <Ticket size={24} />, title: 'โค้ดส่วนลด', desc: 'เพิ่มยอดคำสั่งซื้อโดยมอบโค้ดส่วนลดประจำร้านค้าให้ผู้ซื้อ', color: 'bg-orange-600' }
                  ].map(tool => (
                    <button 
                      key={tool.id}
                      onClick={() => setActiveTab(tool.id as any)}
                      className="flex gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-transparent transition-all text-left group"
                    >
                      <div className={`${tool.color} text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 mb-1 flex items-center gap-1">
                          {tool.title} <ChevronRight size={14} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{tool.desc}</p>
                        <div className="mt-3 text-[10px] font-bold text-blue-500 uppercase tracking-wider">เพิ่มยอดขาย</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 opacity-50 pointer-events-none">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <CheckCircle className="text-blue-500" size={20} /> เครื่องมืออื่นๆ (เร็วๆ นี้)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Shopee Ads', 'แชทบรอดแคสต์', 'สมาชิกในร้าน'].map(t => (
                    <div key={t} className="p-6 border border-gray-100 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                      <div className="font-bold text-gray-400">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Flash Sale Management */}
          {activeTab === 'flash-sale' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">แคมเปญ Flash Sale</h3>
                  <p className="text-sm text-gray-400 mt-1">เลือกสินค้าสูงสุด 20 ชิ้นต่อช่วงเวลา</p>
                </div>
                {!isCreatingFlashSale && (
                  <button onClick={() => { setIsCreatingFlashSale(true); setSelectedProducts([]); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#ee4d2d]/20">สร้างแคมเปญใหม่</button>
                )}
              </div>
              
              {isCreatingFlashSale ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                  <button onClick={() => setIsCreatingFlashSale(false)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                    <ArrowLeft size={20} /> ยกเลิกการสร้าง
                  </button>
                  <form onSubmit={handleCreateFlashSale} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อแคมเปญ</label>
                        <input name="name" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="เช่น Flash Sale ประจำวัน" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">วันที่จัดแคมเปญ</label>
                        <input name="date" type="date" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ช่วงเวลา</label>
                        <select name="time_slot" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none">
                          {['00:00-05:00', '05:00-09:00', '09:00-13:00', '13:00-17:00', '17:00-21:00', '21:00-00:00'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">เลือกสินค้า (สูงสุด 20 ชิ้น)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                        {products.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              if (selectedProducts.includes(p.id)) {
                                setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                              } else if (selectedProducts.length < 20) {
                                setSelectedProducts([...selectedProducts, p.id]);
                              }
                            }}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedProducts.includes(p.id) ? 'border-[#ee4d2d] bg-[#ee4d2d]/5' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                            <img src={p.image_url} className="w-full aspect-square object-cover rounded-xl mb-2" />
                            <div className="text-xs font-bold line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-gray-400">สต็อก: {p.stock}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedProducts.length > 0 && (
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">ตั้งค่าราคา Flash Sale</label>
                        <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                          {selectedProducts.map(id => {
                            const p = products.find(prod => prod.id === id);
                            return (
                              <div key={id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                                <img src={p?.image_url} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 text-sm font-bold">{p?.name}</div>
                                <div className="flex gap-4">
                                  <div className="w-32">
                                    <label className="text-[10px] text-gray-400 block mb-1">ราคา Flash (฿)</label>
                                    <input name={`price_${id}`} type="number" step="0.01" required className="w-full p-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#ee4d2d]" placeholder="0.00" />
                                  </div>
                                  <div className="w-32">
                                    <label className="text-[10px] text-gray-400 block mb-1">จำนวน (ชิ้น)</label>
                                    <input name={`qty_${id}`} type="number" required className="w-full p-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#ee4d2d]" placeholder="0" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#ee4d2d]/20">
                      ยืนยันการสร้าง Flash Sale
                    </button>
                  </form>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-6 gap-2">
                    {['00:00-05:00', '05:00-09:00', '09:00-13:00', '13:00-17:00', '17:00-21:00', '21:00-00:00'].map(slot => (
                      <button key={slot} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#ee4d2d] transition-all text-center group">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">ช่วงเวลา</div>
                        <div className="font-bold text-gray-800 group-hover:text-[#ee4d2d]">{slot}</div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {flashSales.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">แคมเปญ</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ช่วงเวลา</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">จำนวนสินค้า</th>
                            <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {flashSales.map(fs => (
                            <tr key={fs.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-8 py-5 font-bold">{fs.name}</td>
                              <td className="px-8 py-5 text-sm">{fs.date} ({fs.time_slot})</td>
                              <td className="px-8 py-5 text-sm">{fs.items?.length || 0} ชิ้น</td>
                              <td className="px-8 py-5 text-right">
                                <button className="text-blue-500 font-bold text-sm">ดูรายละเอียด</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-20 text-center text-gray-300">
                        <Clock size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="font-medium">ยังไม่มีแคมเปญ Flash Sale ในขณะนี้</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Discount Management */}
          {activeTab === 'discount' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">โปรโมชันส่วนลด</h3>
                  <p className="text-sm text-gray-400 mt-1">สร้างส่วนลดให้กับสินค้าเพื่อกระตุ้นยอดขาย</p>
                </div>
                {!isCreatingDiscount && (
                  <button onClick={() => { setIsCreatingDiscount(true); setSelectedProducts([]); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#ee4d2d]/20">สร้างโปรโมชันใหม่</button>
                )}
              </div>

              {isCreatingDiscount ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                  <button onClick={() => setIsCreatingDiscount(false)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                    <ArrowLeft size={20} /> ยกเลิก
                  </button>
                  <form onSubmit={handleCreateDiscount} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อโปรโมชัน</label>
                        <input name="name" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="เช่น ส่วนลดต้อนรับซัมเมอร์" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">ประเภทส่วนลด</label>
                          <select name="type" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none">
                            <option value="percent">เปอร์เซ็นต์ (%)</option>
                            <option value="fixed">จำนวนเงินคงที่ (฿)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">มูลค่าส่วนลด</label>
                          <input name="value" type="number" step="0.01" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">เวลาเริ่มต้น</label>
                        <input name="start_time" type="datetime-local" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">เวลาสิ้นสุด</label>
                        <input name="end_time" type="datetime-local" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">กลุ่มเป้าหมาย</label>
                        <select name="target_audience" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none">
                          <option value="">ทั้งหมด (All Users)</option>
                          {targetAudiences.map(ta => (
                            <option key={ta.id} value={ta.name}>{ta.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">เลือกสินค้าที่ร่วมรายการ</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                        {products.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              if (selectedProducts.includes(p.id)) {
                                setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                              } else {
                                setSelectedProducts([...selectedProducts, p.id]);
                              }
                            }}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedProducts.includes(p.id) ? 'border-[#ee4d2d] bg-[#ee4d2d]/5' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                            <img src={p.image_url} className="w-full aspect-square object-cover rounded-xl mb-2" />
                            <div className="text-xs font-bold line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-gray-400">ราคาปกติ: ฿{p.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#ee4d2d]/20">
                      ยืนยันการสร้างโปรโมชัน
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {discounts.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ชื่อโปรโมชัน</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ส่วนลด</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ระยะเวลา</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">สินค้า</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {discounts.map(d => (
                          <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5 font-bold">{d.name}</td>
                            <td className="px-8 py-5 text-sm">
                              {d.type === 'percent' ? `${d.value}%` : `฿${d.value}`}
                            </td>
                            <td className="px-8 py-5 text-xs text-gray-500">
                              {new Date(d.start_time).toLocaleString('th-TH')} - <br/>
                              {new Date(d.end_time).toLocaleString('th-TH')}
                            </td>
                            <td className="px-8 py-5 text-sm">{d.items?.length || 0} ชิ้น</td>
                            <td className="px-8 py-5 text-right">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-20 text-center text-gray-300">
                      <Percent size={64} className="mx-auto mb-4 opacity-10" />
                      <p className="font-medium">ยังไม่มีโปรโมชันส่วนลด</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Coupon Management */}
          {activeTab === 'coupon' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">โค้ดส่วนลด</h3>
                  <p className="text-sm text-gray-400 mt-1">สร้างโค้ดส่วนลดเพื่อให้ลูกค้ากรอกตอนชำระเงิน</p>
                </div>
                {!isCreatingCoupon && (
                  <button onClick={() => { setIsCreatingCoupon(true); setSelectedProducts([]); }} className="bg-[#ee4d2d] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#ee4d2d]/20">สร้างโค้ดใหม่</button>
                )}
              </div>

              {isCreatingCoupon ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                  <button onClick={() => setIsCreatingCoupon(false)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                    <ArrowLeft size={20} /> ยกเลิก
                  </button>
                  <form onSubmit={handleCreateCoupon} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อโค้ดส่วนลด</label>
                        <input name="name" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="เช่น โค้ดลดพิเศษ 10%" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">รหัสโค้ด (Code)</label>
                        <input name="code" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="เช่น SUMMER10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">ประเภทส่วนลด</label>
                          <select name="type" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none">
                            <option value="percent">เปอร์เซ็นต์ (%)</option>
                            <option value="fixed">จำนวนเงินคงที่ (฿)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">มูลค่าส่วนลด</label>
                          <input name="value" type="number" step="0.01" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ขั้นต่ำในการสั่งซื้อ (฿)</label>
                        <input name="min_spend" type="number" step="0.01" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">เวลาเริ่มต้น</label>
                        <input name="start_time" type="datetime-local" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">เวลาสิ้นสุด</label>
                        <input name="end_time" type="datetime-local" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">กลุ่มเป้าหมาย</label>
                        <select name="target_audience" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none">
                          <option value="">ทั้งหมด (All Users)</option>
                          {targetAudiences.map(ta => (
                            <option key={ta.id} value={ta.name}>{ta.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">สินค้าที่ใช้โค้ดได้ (เว้นว่างไว้หากใช้ได้กับทุกสินค้า)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                        {products.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              if (selectedProducts.includes(p.id)) {
                                setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                              } else {
                                setSelectedProducts([...selectedProducts, p.id]);
                              }
                            }}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedProducts.includes(p.id) ? 'border-[#ee4d2d] bg-[#ee4d2d]/5' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                            <img src={p.image_url} className="w-full aspect-square object-cover rounded-xl mb-2" />
                            <div className="text-xs font-bold line-clamp-1">{p.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#ee4d2d]/20">
                      ยืนยันการสร้างโค้ดส่วนลด
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {coupons.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ชื่อโค้ด / รหัส</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ส่วนลด</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ขั้นต่ำ</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ระยะเวลา</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {coupons.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="font-bold">{c.name}</div>
                              <div className="text-xs text-[#ee4d2d] font-mono">{c.code}</div>
                            </td>
                            <td className="px-8 py-5 text-sm">
                              {c.type === 'percent' ? `${c.value}%` : `฿${c.value}`}
                            </td>
                            <td className="px-8 py-5 text-sm">฿{c.min_spend}</td>
                            <td className="px-8 py-5 text-xs text-gray-500">
                              {new Date(c.start_time).toLocaleString('th-TH')} - <br/>
                              {new Date(c.end_time).toLocaleString('th-TH')}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-20 text-center text-gray-300">
                      <Ticket size={64} className="mx-auto mb-4 opacity-10" />
                      <p className="font-medium">ยังไม่มีโค้ดส่วนลด</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Order Management */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
                {['ทั้งหมด', 'ที่ต้องชำระ', 'ที่ต้องจัดส่ง', 'กำลังจัดส่ง', 'สำเร็จแล้ว', 'ยกเลิกแล้ว', 'คืนเงิน/คืนสินค้า'].map((t, i) => (
                  <button key={t} className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-[#ee4d2d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-400">คำสั่งซื้อ #{order.id}</span>
                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('th-TH')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status === 'to_ship' ? 'ที่ต้องจัดส่ง' : order.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0">
                          <img src={item.image_url} className="w-16 h-16 rounded-xl object-cover border" />
                          <div className="flex-1">
                            <div className="font-bold text-gray-800">{item.product_name}</div>
                            <div className="text-xs text-gray-400">จำนวน: x{item.quantity}</div>
                          </div>
                          <div className="font-bold text-gray-700">฿{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-sm text-gray-500">ยอดรวมคำสั่งซื้อ: <span className="text-xl font-bold text-[#ee4d2d] ml-2">฿{order.total_amount.toLocaleString()}</span></div>
                      <div className="flex gap-2">
                        {order.status === 'to_ship' && (
                          <button onClick={() => updateOrderStatus(order.id, 'shipping')} className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#ee4d2d]/20">จัดส่งสินค้า</button>
                        )}
                        {order.status === 'shipping' && (
                          <button onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-500/20">จัดส่งสำเร็จ</button>
                        )}
                        <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-bold text-gray-500 hover:bg-white transition-colors">ดูรายละเอียด</button>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-24 text-center text-gray-300 bg-white rounded-3xl border border-gray-100">
                    <ShoppingBag size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">ยังไม่มีรายการคำสั่งซื้อ</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Target Audience Management */}
          {activeTab === 'target-audience' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">จัดการกลุ่มเป้าหมาย</h3>
                  <p className="text-sm text-gray-400 mt-1">สร้างและจัดการกลุ่มลูกค้าสำหรับโปรโมชัน</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                    <h4 className="font-bold mb-4">สร้างกลุ่มเป้าหมายใหม่</h4>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = Object.fromEntries(formData.entries());
                      await fetch('/api/target-audiences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });
                      (e.target as HTMLFormElement).reset();
                      fetchData();
                    }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ชื่อกลุ่ม</label>
                        <input name="name" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="เช่น ลูกค้าใหม่, VIP" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ระดับการศึกษา</label>
                        <select name="education_level" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm">
                          <option value="">ไม่ระบุ</option>
                          <option value="มัธยมต้น">มัธยมต้น</option>
                          <option value="มัธยมปลาย">มัธยมปลาย</option>
                          <option value="ปริญญาตรี">ปริญญาตรี</option>
                          <option value="ปริญญาโท">ปริญญาโท</option>
                          <option value="ปริญญาเอก">ปริญญาเอก</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ระดับ Royalty</label>
                        <select name="royalty_level" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm">
                          <option value="">ไม่ระบุ</option>
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Platinum">Platinum</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">จังหวัด</label>
                        <input name="province" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="เช่น กรุงเทพฯ, เชียงใหม่" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">คณะที่สนใจ</label>
                        <input name="faculty" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="เช่น วิศวกรรมศาสตร์, แพทยศาสตร์" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tag ของลูกค้า</label>
                        <input name="tags" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="เช่น #สายเปย์, #ลูกค้าเก่า (คั่นด้วยคอมม่า)" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">คำอธิบาย</label>
                        <textarea name="description" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm h-20" placeholder="ระบุรายละเอียดเพิ่มเติม..." />
                      </div>
                      <button type="submit" className="w-full bg-[#ee4d2d] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#ee4d2d]/20 hover:bg-[#f05d40] transition-all">
                        บันทึกกลุ่มเป้าหมาย
                      </button>
                    </form>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">ชื่อกลุ่ม</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">เงื่อนไข / รายละเอียด</th>
                          <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {targetAudiences.map(ta => (
                          <tr key={ta.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5 font-bold">{ta.name}</td>
                            <td className="px-8 py-5 text-sm text-gray-500">
                              <div className="space-y-1">
                                {ta.education_level && <div className="flex gap-2"><span className="font-bold text-gray-400">การศึกษา:</span> {ta.education_level}</div>}
                                {ta.royalty_level && <div className="flex gap-2"><span className="font-bold text-gray-400">Royalty:</span> {ta.royalty_level}</div>}
                                {ta.province && <div className="flex gap-2"><span className="font-bold text-gray-400">จังหวัด:</span> {ta.province}</div>}
                                {ta.faculty && <div className="flex gap-2"><span className="font-bold text-gray-400">คณะ:</span> {ta.faculty}</div>}
                                {ta.tags && <div className="flex gap-2"><span className="font-bold text-gray-400">Tags:</span> {ta.tags}</div>}
                                {ta.description && <div className="mt-2 pt-2 border-t border-gray-100 italic">{ta.description}</div>}
                                {!ta.education_level && !ta.royalty_level && !ta.province && !ta.faculty && !ta.tags && !ta.description && <span>-</span>}
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={async () => {
                                if (confirm('ลบกลุ่มเป้าหมายนี้?')) {
                                  await fetch(`/api/target-audiences/${ta.id}`, { method: 'DELETE' });
                                  fetchData();
                                }
                              }} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {targetAudiences.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-8 py-12 text-center text-gray-300">
                              <Users size={48} className="mx-auto mb-2 opacity-10" />
                              <p>ยังไม่มีกลุ่มเป้าหมาย</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Ads Management */}
          {activeTab === 'ads' && (
            <div className="space-y-8">
              {isEditingAd ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
                  <button onClick={() => setIsEditingAd(null)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                    <ArrowLeft size={20} /> กลับสู่รายการโฆษณา
                  </button>
                  <form onSubmit={handleSaveAd} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อโฆษณา</label>
                      <input name="title" defaultValue={isEditingAd.title} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ลิงก์ปลายทาง</label>
                      <input name="link_url" defaultValue={isEditingAd.link_url} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" placeholder="/category/1 หรือ https://..." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ตำแหน่ง</label>
                      <select name="position" defaultValue={isEditingAd.position} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all">
                        <option value="home_top">หน้าหลัก (บน)</option>
                        <option value="home_middle">หน้าหลัก (กลาง)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพโฆษณา</label>
                      <div className="flex items-center gap-4">
                        <div className="w-40 h-24 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                          {isEditingAd.image_url ? (
                            <img src={isEditingAd.image_url} className="w-full h-full object-cover" alt="Ad" />
                          ) : (
                            <ImageIcon className="text-gray-300" size={32} />
                          )}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                            <Upload size={16} className="mr-1" /> เปลี่ยนรูป
                            <input type="file" accept="image/*" className="hidden" onChange={handleAdImageUpload} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-400">แนะนำขนาด 1200x400 px</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="active" defaultChecked={isEditingAd.active === 1} className="w-5 h-5 accent-[#ee4d2d]" />
                      <label className="text-sm font-bold text-gray-700">เปิดใช้งาน</label>
                    </div>
                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#ee4d2d]/20 hover:bg-[#f05d40] transition-all">
                      บันทึกโฆษณา
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map(ad => (
                    <div key={ad.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
                      <div className="h-40 relative">
                        <img src={ad.image_url} className="w-full h-full object-cover" alt={ad.title} />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button onClick={() => setIsEditingAd(ad)} className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-blue-500 shadow-sm hover:bg-white transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 shadow-sm hover:bg-white transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ad.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {ad.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-bold mb-1">{ad.title}</h4>
                        <p className="text-xs text-gray-400 mb-4">ตำแหน่ง: {ad.position === 'home_top' ? 'หน้าหลัก (บน)' : 'หน้าหลัก (กลาง)'}</p>
                        <div className="text-xs text-gray-500 truncate bg-gray-50 p-2 rounded-lg">
                          {ad.link_url || 'ไม่มีลิงก์'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {ads.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-300">
                      <Megaphone size={64} className="mx-auto mb-4 opacity-10" />
                      <p className="text-lg">ยังไม่มีโฆษณา</p>
                      <button onClick={() => setIsEditingAd({ active: 1, position: 'home_top' })} className="mt-4 text-[#ee4d2d] font-bold hover:underline">สร้างโฆษณาแรกของคุณ</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Site Content Management */}
          {activeTab === 'content' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Monitor className="text-[#ee4d2d]" size={24} />
                  จัดการเนื้อหาหน้าหลัก (Hero Section)
                </h3>
                <form onSubmit={handleSaveSiteConfig} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อหลัก (Hero Title)</label>
                        <input name="hero_title" defaultValue={siteConfig.hero_title} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อย่อย (Hero Subtitle)</label>
                        <textarea name="hero_subtitle" defaultValue={siteConfig.hero_subtitle} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none transition-all h-32" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพพื้นหลัง (Hero Background)</label>
                      <div className="w-full aspect-video bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                        {siteConfig.hero_image ? (
                          <img src={siteConfig.hero_image} className="w-full h-full object-cover" alt="Hero" />
                        ) : (
                          <ImageIcon className="text-gray-300" size={48} />
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold">
                          <Upload size={20} className="mr-2" /> เปลี่ยนรูปภาพพื้นหลัง
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleConfigImageUpload(e, 'hero_image')} />
                        </label>
                      </div>
                      <input type="hidden" name="hero_image" value={siteConfig.hero_image || ''} />
                      <p className="text-xs text-gray-400 mt-4">แนะนำขนาด 1920x1080 px เพื่อความคมชัดสูงสุด</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t">
                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#ee4d2d]/20 hover:bg-[#f05d40] transition-all">
                      บันทึกการตั้งค่าหน้าเว็บ
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                <div className="bg-blue-500 text-white p-2 rounded-xl">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">เคล็ดลับการออกแบบ</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    ใช้รูปภาพที่มีคุณภาพสูงและข้อความที่ดึงดูดใจเพื่อเพิ่มอัตราการคลิก (CTR) ของลูกค้า 
                    หัวข้อที่สั้นและกระชับมักจะทำงานได้ดีกว่าในอุปกรณ์มือถือ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Articles Management */}
          {activeTab === 'articles' && (
            <div className="space-y-8">
              {isEditingArticle ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
                  <button onClick={() => setIsEditingArticle(null)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
                    <ArrowLeft size={20} /> กลับสู่รายการบทความ
                  </button>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());
                    
                    const method = isEditingArticle.id ? 'PUT' : 'POST';
                    const url = isEditingArticle.id ? `/api/articles/${isEditingArticle.id}` : '/api/articles';
                    
                    const payload = {
                      ...data,
                      thumbnail_url: isEditingArticle.thumbnail_url,
                      is_recommended: isEditingArticle.is_recommended ? 1 : 0,
                      product_ids: isEditingArticle.product_ids || []
                    };
                    
                    await fetch(url, {
                      method,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    setIsEditingArticle(null);
                    fetchData();
                  }} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อบทความ</label>
                          <input 
                            name="title" 
                            defaultValue={isEditingArticle.title} 
                            required 
                            onChange={(e) => {
                              if (!isEditingArticle.id) {
                                const slug = e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                                if (slugInput) slugInput.value = slug;
                              }
                            }}
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-lg font-bold" 
                            placeholder="ระบุหัวข้อบทความ..." 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">เนื้อหาบทความ (รองรับ HTML/Links)</label>
                          <textarea 
                            name="content" 
                            defaultValue={isEditingArticle.content} 
                            required 
                            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none h-[400px] font-serif leading-relaxed" 
                            placeholder="เขียนเนื้อหาบทความที่นี่... คุณสามารถใส่ลิงก์หรือโค้ด HTML ได้" 
                          />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                          <h4 className="font-bold text-gray-700 flex items-center gap-2">
                            <Search size={18} className="text-[#ee4d2d]" /> ตั้งค่า SEO (SEO Template)
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">URL Slug</label>
                              <input name="slug" defaultValue={isEditingArticle.slug} required className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="article-url-slug" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Meta Title</label>
                              <input name="meta_title" defaultValue={isEditingArticle.meta_title} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm" placeholder="หัวข้อสำหรับ Google Search" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Meta Description</label>
                              <textarea name="meta_description" defaultValue={isEditingArticle.meta_description} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ee4d2d] outline-none text-sm h-20" placeholder="คำอธิบายสั้นๆ สำหรับ Google Search" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพหน้าปก</label>
                          <div className="aspect-video bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                            {isEditingArticle.thumbnail_url ? (
                              <img src={isEditingArticle.thumbnail_url} className="w-full h-full object-cover" alt="Thumbnail" />
                            ) : (
                              <ImageIcon className="text-gray-300" size={48} />
                            )}
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold text-sm">
                              <Upload size={20} className="mr-2" /> อัปโหลดหน้าปก
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onloadend = () => setIsEditingArticle({ ...isEditingArticle, thumbnail_url: reader.result as string });
                                  reader.readAsDataURL(file);
                                }} 
                              />
                            </label>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={isEditingArticle.is_recommended === 1}
                                onChange={(e) => setIsEditingArticle({ ...isEditingArticle, is_recommended: e.target.checked ? 1 : 0 })}
                                className="sr-only"
                              />
                              <div className={`w-12 h-6 rounded-full transition-colors ${isEditingArticle.is_recommended === 1 ? 'bg-[#ee4d2d]' : 'bg-gray-300'}`}></div>
                              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${isEditingArticle.is_recommended === 1 ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <span className="font-bold text-gray-700">แนะนำบทความนี้ (แสดงบนหน้าแรก)</span>
                          </label>
                          <p className="text-[10px] text-gray-400 italic">บทความที่ถูกแนะนำจะแสดงในส่วน "บทความแนะนำ" บนหน้าหลักของเว็บไซต์</p>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-bold text-gray-700">สินค้าแนะนำในบทความ</label>
                          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-2 max-h-[300px] overflow-y-auto">
                            {products.map(p => (
                              <div 
                                key={p.id} 
                                onClick={() => {
                                  const current = isEditingArticle.product_ids || [];
                                  const next = current.includes(p.id) ? current.filter((id: number) => id !== p.id) : [...current, p.id];
                                  setIsEditingArticle({ ...isEditingArticle, product_ids: next });
                                }}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${isEditingArticle.product_ids?.includes(p.id) ? 'bg-[#ee4d2d] text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
                              >
                                <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="text-xs font-bold flex-1 truncate">{p.name}</div>
                                {isEditingArticle.product_ids?.includes(p.id) && <CheckCircle size={14} />}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400 italic">* เลือกสินค้าที่ต้องการแนะนำในเนื้อหาบทความ</p>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-[#ee4d2d] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#ee4d2d]/20 hover:bg-[#f05d40] transition-all">
                      {isEditingArticle.id ? 'บันทึกการแก้ไขบทความ' : 'เผยแพร่บทความ'}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map(article => (
                    <div key={article.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
                      <div className="h-48 relative">
                        <img src={article.thumbnail_url || 'https://picsum.photos/seed/article/800/400'} className="w-full h-full object-cover" alt={article.title} />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => {
                              const res = await fetch(`/api/articles/${article.id}`);
                              const data = await res.json();
                              setIsEditingArticle({ ...data, product_ids: data.products?.map((p: any) => p.id) || [] });
                            }} 
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-blue-500 shadow-sm hover:bg-white transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm('ลบบทความนี้?')) {
                                await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
                                fetchData();
                              }
                            }} 
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-500 shadow-sm hover:bg-white transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                          <Clock size={12} /> แก้ไขล่าสุด: {new Date(article.updated_at).toLocaleDateString('th-TH')}
                        </div>
                        <h4 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h4>
                        <div className="text-xs text-gray-500 line-clamp-2 mb-4">
                          {article.meta_description || 'ไม่มีคำอธิบาย'}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="text-[10px] font-mono text-gray-400">/{article.slug}</div>
                          <div className="flex gap-2">
                            {article.is_recommended === 1 && (
                              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">บทความที่แนะนำในหน้าแรก</div>
                            )}
                            <div className="text-[10px] font-bold text-[#ee4d2d] bg-[#ee4d2d]/5 px-2 py-1 rounded-full">SEO Optimized</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <div className="col-span-full py-24 text-center text-gray-300">
                      <FileText size={64} className="mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-medium">ยังไม่มีบทความ</p>
                      <button 
                        onClick={() => setIsEditingArticle({ title: '', slug: '', content: '', meta_title: '', meta_description: '', thumbnail_url: '', product_ids: [] })} 
                        className="mt-4 text-[#ee4d2d] font-bold hover:underline"
                      >
                        เริ่มเขียนบทความแรกของคุณ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Category Modal */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6">{isEditingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ชื่อหมวดหมู่</label>
                  <input 
                    type="text" 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="ชื่อหมวดหมู่..."
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Headline โปรโมท</label>
                  <input 
                    type="text" 
                    value={newCategoryHeadline}
                    onChange={(e) => setNewCategoryHeadline(e.target.value)}
                    placeholder="เช่น คอลเลกชันใหม่ล่าสุด..."
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ee4d2d] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ภาพโปรโมท</label>
                  <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative group overflow-hidden">
                    {newCategoryPromo ? (
                      <img src={newCategoryPromo} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                      <Upload size={16} className="mr-1" /> {newCategoryPromo ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => setNewCategoryPromo(reader.result as string);
                          reader.readAsDataURL(file);
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowCatModal(false); setIsEditingCategory(null); setNewCategory(''); setNewCategoryPromo(''); setNewCategoryHeadline(''); }} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
                <button onClick={handleAddCategory} className="flex-1 bg-[#ee4d2d] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#ee4d2d]/20">
                  {isEditingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
