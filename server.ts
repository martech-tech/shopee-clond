import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("ecommerce.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    promo_image TEXT,
    headline TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT, -- Primary image
    images TEXT, -- JSON array of additional images
    stock INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  -- Marketing Centre Tables
  CREATE TABLE IF NOT EXISTS flash_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    time_slot TEXT NOT NULL, -- e.g., "00:00-05:00"
    date TEXT NOT NULL, -- YYYY-MM-DD
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS flash_sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flash_sale_id INTEGER,
    product_id INTEGER,
    flash_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    sold INTEGER DEFAULT 0,
    FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS discounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL, -- "percent" or "fixed"
    value REAL NOT NULL,
    target_audience TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS discount_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discount_id INTEGER,
    product_id INTEGER,
    FOREIGN KEY (discount_id) REFERENCES discounts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL, -- "percent" or "fixed"
    value REAL NOT NULL,
    min_spend REAL DEFAULT 0,
    target_audience TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS coupon_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_id INTEGER,
    product_id INTEGER,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- Order Management
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL, -- "to_pay", "to_ship", "shipping", "completed", "cancelled", "refund"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS target_audiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    education_level TEXT,
    royalty_level TEXT,
    province TEXT,
    faculty TEXT,
    tags TEXT
  );

  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT DEFAULT 'home_top',
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    thumbnail_url TEXT,
    is_recommended INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS article_products (
    article_id INTEGER,
    product_id INTEGER,
    PRIMARY KEY (article_id, product_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );
`);

// Migration for categories
try {
  db.prepare(`ALTER TABLE categories ADD COLUMN promo_image TEXT`).run();
} catch (e) {}
try {
  db.prepare(`ALTER TABLE categories ADD COLUMN headline TEXT`).run();
} catch (e) {}

// Migration for target_audiences
const columns = ['education_level', 'royalty_level', 'province', 'faculty', 'tags'];
for (const col of columns) {
  try {
    db.prepare(`ALTER TABLE target_audiences ADD COLUMN ${col} TEXT`).run();
  } catch (e) {
    // Column already exists or other error
  }
}

// Migration for products
try {
  db.prepare(`ALTER TABLE products ADD COLUMN sold_count INTEGER DEFAULT 0`).run();
} catch (e) {
  // Column already exists
}

try {
  db.prepare(`ALTER TABLE products ADD COLUMN images TEXT`).run();
} catch (e) {
  // Column already exists
}

// Migration for articles
try {
  db.prepare(`ALTER TABLE articles ADD COLUMN is_recommended INTEGER DEFAULT 0`).run();
} catch (e) {
  // Column already exists
}

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name, promo_image, headline) VALUES (?, ?, ?)");
  insertCat.run("สินค้าใหม่", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200", "คอลเลกชันใหม่ล่าสุด");
  insertCat.run("Event", "https://images.unsplash.com/photo-1523381235208-87319f63766a?auto=format&fit=crop&q=80&w=1200", "กิจกรรมพิเศษสำหรับคุณ");
  insertCat.run("Course แนะนำ", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200", "คอร์สเรียนยอดนิยม");
  insertCat.run("Electronics", null, null);
  insertCat.run("Fashion", null, null);
  insertCat.run("Home & Living");
  insertCat.run("Beauty");

  const insertProd = db.prepare("INSERT INTO products (name, description, price, image_url, images, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertProd.run("Smartphone X", "High-end smartphone with amazing camera", 25900, "https://picsum.photos/seed/phone/400/400", JSON.stringify([]), 50, 1);
  insertProd.run("Wireless Headphones", "Noise cancelling wireless headphones", 5900, "https://picsum.photos/seed/headphones/400/400", JSON.stringify([]), 30, 1);
  insertProd.run("Cotton T-Shirt", "Comfortable 100% cotton t-shirt", 290, "https://picsum.photos/seed/tshirt/400/400", JSON.stringify([]), 100, 2);
  insertProd.run("Modern Sofa", "Minimalist sofa for your living room", 12000, "https://picsum.photos/seed/sofa/400/400", JSON.stringify([]), 10, 3);

  // Seed site config
  const insertConfig = db.prepare("INSERT OR IGNORE INTO site_config (key, value) VALUES (?, ?)");
  insertConfig.run("hero_title", "ค้นพบสไตล์ที่ใช่สำหรับคุณ");
  insertConfig.run("hero_subtitle", "สินค้าคุณภาพดีที่สุด พร้อมโปรโมชั่นสุดพิเศษสำหรับคุณโดยเฉพาะ");
  insertConfig.run("hero_image", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920");

  // Seed initial ads
  const insertAd = db.prepare("INSERT INTO ads (title, image_url, link_url, position) VALUES (?, ?, ?, ?)");
  insertAd.run("Summer Sale", "https://images.unsplash.com/photo-1523381235208-87319f63766a?auto=format&fit=crop&q=80&w=1200", "/category/2", "home_top");
  insertAd.run("New Collection", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200", "/category/1", "home_top");
}

// Ensure required categories exist even if table is not empty
const requiredCategories = [
  { name: "สินค้าใหม่", promo: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200", headline: "คอลเลกชันใหม่ล่าสุด" },
  { name: "Event", promo: "https://images.unsplash.com/photo-1523381235208-87319f63766a?auto=format&fit=crop&q=80&w=1200", headline: "กิจกรรมพิเศษสำหรับคุณ" },
  { name: "Course แนะนำ", promo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200", headline: "คอร์สเรียนยอดนิยม" }
];

for (const cat of requiredCategories) {
  const exists = db.prepare("SELECT id FROM categories WHERE name = ?").get(cat.name);
  if (!exists) {
    db.prepare("INSERT INTO categories (name, promo_image, headline) VALUES (?, ?, ?)").run(cat.name, cat.promo, cat.headline);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
  const PORT = 3000;

  // API Routes
  app.get("/api/products", (req, res) => {
    const { search } = req.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params: any[] = [];
    if (search) {
      query += ` WHERE p.name LIKE ?`;
      params.push(`%${search}%`);
    }
    const products = db.prepare(query).all(params);
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, description, price, image_url, images, stock, category_id } = req.body;
    const info = db.prepare("INSERT INTO products (name, description, price, image_url, images, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, description, price, image_url, JSON.stringify(images || []), stock, category_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, description, price, image_url, images, stock, category_id, sold_count } = req.body;
    db.prepare("UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, images = ?, stock = ?, category_id = ?, sold_count = ? WHERE id = ?").run(name, description, price, image_url, JSON.stringify(images || []), stock, category_id, sold_count || 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name, promo_image, headline } = req.body;
    const info = db.prepare("INSERT INTO categories (name, promo_image, headline) VALUES (?, ?, ?)").run(name, promo_image, headline);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/categories/:id", (req, res) => {
    const { name, promo_image, headline } = req.body;
    db.prepare("UPDATE categories SET name = ?, promo_image = ?, headline = ? WHERE id = ?").run(name, promo_image, headline, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", (req, res) => {
    // Optional: Check if products exist in this category before deleting
    // For now, we'll just set category_id to NULL for those products
    db.prepare("UPDATE products SET category_id = NULL WHERE category_id = ?").run(req.params.id);
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Flash Sales
  app.get("/api/flash-sales", (req, res) => {
    const sales = db.prepare("SELECT * FROM flash_sales").all();
    const salesWithItems = sales.map((sale: any) => {
      const items = db.prepare("SELECT fsi.*, p.name as product_name, p.image_url FROM flash_sale_items fsi JOIN products p ON fsi.product_id = p.id WHERE fsi.flash_sale_id = ?").all(sale.id);
      return { ...sale, items };
    });
    res.json(salesWithItems);
  });

  app.post("/api/flash-sales", (req, res) => {
    const { name, time_slot, date, items } = req.body;
    const transaction = db.transaction(() => {
      const info = db.prepare("INSERT INTO flash_sales (name, time_slot, date) VALUES (?, ?, ?)").run(name, time_slot, date);
      const saleId = info.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_price, quantity) VALUES (?, ?, ?, ?)");
      for (const item of items) {
        insertItem.run(saleId, item.product_id, item.flash_price, item.quantity);
      }
      return saleId;
    });
    res.json({ id: transaction() });
  });

  // Discounts
  app.get("/api/discounts", (req, res) => {
    const discounts = db.prepare("SELECT * FROM discounts").all();
    const discountsWithItems = discounts.map((d: any) => {
      const items = db.prepare("SELECT di.*, p.name as product_name FROM discount_items di JOIN products p ON di.product_id = p.id WHERE di.discount_id = ?").all(d.id);
      return { ...d, items };
    });
    res.json(discountsWithItems);
  });

  app.post("/api/discounts", (req, res) => {
    const { name, start_time, end_time, type, value, target_audience, items } = req.body;
    const transaction = db.transaction(() => {
      const info = db.prepare("INSERT INTO discounts (name, start_time, end_time, type, value, target_audience) VALUES (?, ?, ?, ?, ?, ?)").run(name, start_time, end_time, type, value, target_audience);
      const discountId = info.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO discount_items (discount_id, product_id) VALUES (?, ?)");
      for (const productId of items) {
        insertItem.run(discountId, productId);
      }
      return discountId;
    });
    res.json({ id: transaction() });
  });

  // Coupons
  app.get("/api/coupons", (req, res) => {
    const coupons = db.prepare("SELECT * FROM coupons").all();
    const couponsWithItems = coupons.map((c: any) => {
      const items = db.prepare("SELECT ci.*, p.name as product_name FROM coupon_items ci JOIN products p ON ci.product_id = p.id WHERE ci.coupon_id = ?").all(c.id);
      return { ...c, items };
    });
    res.json(couponsWithItems);
  });

  app.post("/api/coupons", (req, res) => {
    const { name, code, start_time, end_time, type, value, min_spend, target_audience, items } = req.body;
    const transaction = db.transaction(() => {
      const info = db.prepare("INSERT INTO coupons (name, code, start_time, end_time, type, value, min_spend, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(name, code, start_time, end_time, type, value, min_spend, target_audience);
      const couponId = info.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO coupon_items (coupon_id, product_id) VALUES (?, ?)");
      for (const productId of items) {
        insertItem.run(couponId, productId);
      }
      return couponId;
    });
    res.json({ id: transaction() });
  });

  app.get("/api/promotions", (req, res) => {
    // Compatibility route for old promotion system
    const discounts = db.prepare("SELECT * FROM discounts WHERE active = 1").all();
    const flashSales = db.prepare("SELECT * FROM flash_sales WHERE active = 1").all();
    
    // Map to old format for compatibility
    const legacyPromotions = [
      ...discounts.map((d: any) => ({
        id: d.id,
        name: d.name,
        discount_percent: d.type === 'percent' ? d.value : 0,
        active: d.active
      })),
      ...flashSales.map((fs: any) => ({
        id: fs.id,
        name: fs.name,
        discount_percent: 0,
        active: fs.active
      }))
    ];
    res.json(legacyPromotions);
  });

  // Orders
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare("SELECT oi.*, p.name as product_name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?").all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  });

  // Target Audiences
  app.get("/api/target-audiences", (req, res) => {
    const audiences = db.prepare("SELECT * FROM target_audiences").all();
    res.json(audiences);
  });

  app.post("/api/target-audiences", (req, res) => {
    const { name, description, education_level, royalty_level, province, faculty, tags } = req.body;
    const info = db.prepare("INSERT INTO target_audiences (name, description, education_level, royalty_level, province, faculty, tags) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, description, education_level, royalty_level, province, faculty, tags);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/target-audiences/:id", (req, res) => {
    db.prepare("DELETE FROM target_audiences WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/orders", (req, res) => {
    const { items, total_amount } = req.body;
    const transaction = db.transaction(() => {
      const info = db.prepare("INSERT INTO orders (total_amount, status) VALUES (?, ?)").run(total_amount, "to_ship");
      const orderId = info.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      const updateStock = db.prepare("UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?");
      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.price);
        updateStock.run(item.quantity, item.quantity, item.id);
      }
      return orderId;
    });
    res.json({ id: transaction() });
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Ads API
  app.get("/api/ads", (req, res) => {
    const ads = db.prepare("SELECT * FROM ads").all();
    res.json(ads);
  });

  app.post("/api/ads", (req, res) => {
    const { title, image_url, link_url, position, active } = req.body;
    const info = db.prepare("INSERT INTO ads (title, image_url, link_url, position, active) VALUES (?, ?, ?, ?, ?)").run(title, image_url, link_url, position || 'home_top', active !== undefined ? active : 1);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/ads/:id", (req, res) => {
    const { title, image_url, link_url, position, active } = req.body;
    db.prepare("UPDATE ads SET title = ?, image_url = ?, link_url = ?, position = ?, active = ? WHERE id = ?").run(title, image_url, link_url, position, active, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/ads/:id", (req, res) => {
    db.prepare("DELETE FROM ads WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Site Config API
  app.get("/api/site-config", (req, res) => {
    const configs = db.prepare("SELECT * FROM site_config").all();
    const configMap = configs.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(configMap);
  });

  app.post("/api/site-config", (req, res) => {
    const configs = req.body; // Expecting an object { key: value, ... }
    const transaction = db.transaction(() => {
      const upsert = db.prepare("INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)");
      for (const [key, value] of Object.entries(configs)) {
        upsert.run(key, String(value));
      }
    });
    transaction();
    res.json({ success: true });
  });

  // Articles API
  app.get("/api/articles", (req, res) => {
    const { recommended } = req.query;
    let query = "SELECT * FROM articles";
    const params: any[] = [];
    
    if (recommended === 'true') {
      query += " WHERE is_recommended = 1";
    }
    
    query += " ORDER BY updated_at DESC";
    const articles = db.prepare(query).all(params);
    res.json(articles);
  });

  app.get("/api/articles/:idOrSlug", (req, res) => {
    const { idOrSlug } = req.params;
    let article;
    
    // Try finding by ID first if it's a number
    if (!isNaN(Number(idOrSlug))) {
      article = db.prepare("SELECT * FROM articles WHERE id = ?").get(idOrSlug) as any;
    }
    
    // If not found by ID (or not a number), try finding by slug
    if (!article) {
      article = db.prepare("SELECT * FROM articles WHERE slug = ?").get(idOrSlug) as any;
    }

    if (!article) return res.status(404).json({ error: "Article not found" });
    
    const products = db.prepare(`
      SELECT p.* 
      FROM products p 
      JOIN article_products ap ON p.id = ap.product_id 
      WHERE ap.article_id = ?
    `).all(article.id);
    
    res.json({ ...article, products });
  });

  app.post("/api/articles", (req, res) => {
    const { title, slug, content, meta_title, meta_description, thumbnail_url, is_recommended, product_ids } = req.body;
    const transaction = db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO articles (title, slug, content, meta_title, meta_description, thumbnail_url, is_recommended, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(title, slug, content, meta_title, meta_description, thumbnail_url, is_recommended ? 1 : 0);
      
      const articleId = info.lastInsertRowid;
      if (product_ids && Array.isArray(product_ids)) {
        const insertProduct = db.prepare("INSERT INTO article_products (article_id, product_id) VALUES (?, ?)");
        for (const productId of product_ids) {
          insertProduct.run(articleId, productId);
        }
      }
      return articleId;
    });
    res.json({ id: transaction() });
  });

  app.put("/api/articles/:id", (req, res) => {
    const { title, slug, content, meta_title, meta_description, thumbnail_url, is_recommended, product_ids } = req.body;
    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE articles 
        SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, thumbnail_url = ?, is_recommended = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(title, slug, content, meta_title, meta_description, thumbnail_url, is_recommended ? 1 : 0, req.params.id);
      
      db.prepare("DELETE FROM article_products WHERE article_id = ?").run(req.params.id);
      if (product_ids && Array.isArray(product_ids)) {
        const insertProduct = db.prepare("INSERT INTO article_products (article_id, product_id) VALUES (?, ?)");
        for (const productId of product_ids) {
          insertProduct.run(req.params.id, productId);
        }
      }
    });
    transaction();
    res.json({ success: true });
  });

  app.delete("/api/articles/:id", (req, res) => {
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM article_products WHERE article_id = ?").run(req.params.id);
      db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
    });
    transaction();
    res.json({ success: true });
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
