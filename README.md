# 🗺️ Interactive Roadmap Builder

Ứng dụng web xây dựng lộ trình học tập trực quan với **kéo thả**, nội dung Markdown, và tối ưu **SEO mạnh mẽ**.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | MongoDB + Mongoose |
| Kéo thả | React Flow v11 |
| UI | Tailwind CSS + Shadcn/UI |
| Content | next-mdx-remote (Markdown → React) |
| Deploy | Vercel (khuyến nghị) |

---

## 🚀 Bắt đầu nhanh

### 1. Cài đặt

```bash
git clone <repo-url>
cd interactive-roadmap-builder
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roadmap-builder
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Interactive Roadmap Builder"
REVALIDATION_SECRET=your-secret-here
```

### 3. Seed dữ liệu mẫu

```bash
npx tsx scripts/seed.ts
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## 📁 Cấu trúc dự án

```
src/
├── app/
│   ├── layout.tsx              # Root layout + default SEO metadata
│   ├── page.tsx                # Trang chủ - danh sách roadmaps
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── robots.ts               # robots.txt
│   ├── not-found.tsx           # Custom 404
│   └── roadmap/
│       └── [roadmap-slug]/
│           ├── page.tsx        # ✅ Trang Roadmap (SSG + ISR)
│           ├── loading.tsx     # Skeleton loading
│           └── [node-slug]/
│               ├── page.tsx    # ✅ Trang bài học chi tiết (SEO)
│               └── loading.tsx
│
├── actions/
│   └── roadmap.ts              # Server Actions (CRUD với MongoDB)
│
├── components/
│   ├── RoadmapBuilder.tsx      # Client: React Flow canvas chính
│   ├── CustomRoadmapNode.tsx   # Custom node UI
│   ├── NodeEditModal.tsx       # Modal chỉnh sửa Markdown
│   └── JsonLd.tsx              # Structured Data (Schema.org)
│
├── lib/
│   ├── mongodb.ts              # MongoDB singleton connection
│   └── utils.ts                # Utilities: slug, excerpt, cn()...
│
├── models/
│   └── Roadmap.ts              # Mongoose Schema
│
└── types/
    └── index.ts                # TypeScript interfaces
```

---

## 🗄️ Database Schema

```typescript
// Roadmap Document
{
  title: string,        // "Lộ trình học Frontend 2025"
  slug: string,         // "lo-trinh-hoc-frontend-2025" (unique, indexed)
  description: string,  // SEO meta description
  author: { name, avatar },
  category: string,     // "Frontend" | "Backend" | "DevOps"
  tags: string[],
  isPublished: boolean,
  viewCount: number,
  
  nodes: [{
    id: string,         // React Flow node ID
    type: "roadmapNode",
    position: { x, y }, // Vị trí trên canvas
    data: {
      label: string,    // "HTML Cơ bản"
      slug: string,     // "html-co-ban" → URL: /roadmap/[slug]/html-co-ban
      content: string,  // Nội dung Markdown đầy đủ
      description: string, // 160 ký tự cho meta description
      status: "locked" | "available" | "active" | "completed",
      icon: string,
      estimatedTime: string,
      difficulty: "beginner" | "intermediate" | "advanced",
      tags: string[],
      resources: [{ title, url, type }]
    }
  }],
  
  edges: [{
    id, source, target,  // React Flow edge
    type: "smoothstep",
    animated: boolean
  }]
}
```

---

## 🌐 SEO Architecture

### URL Structure
```
/                                      → Danh sách roadmaps
/roadmap/[roadmap-slug]               → Xem/Edit roadmap (React Flow)
/roadmap/[roadmap-slug]/[node-slug]   → Trang bài học chi tiết
/sitemap.xml                          → Tự động generate
/robots.txt                           → Tự động generate
```

### SEO Features
- ✅ **generateMetadata()** - Metadata động từ MongoDB cho mỗi trang
- ✅ **generateStaticParams()** - SSG cho tất cả roadmaps & nodes lúc build
- ✅ **ISR (Incremental Static Regeneration)** - Revalidate 1h
- ✅ **On-demand Revalidation** - `/api/revalidate` khi publish mới
- ✅ **JSON-LD Schema.org** - `Course` cho roadmap, `Article` cho bài học
- ✅ **OpenGraph + Twitter Card** - Preview đẹp khi share
- ✅ **Sitemap.xml** tự động với lastmod
- ✅ **Canonical URLs** - Tránh duplicate content
- ✅ **Breadcrumb markup** - Hiển thị path trên Google Search

### Core Web Vitals Optimizations
| Metric | Giải pháp |
|--------|-----------|
| **LCP** | SSG/ISR (HTML sẵn từ CDN), next/image, font preload |
| **CLS** | Skeleton loading giữ chiều cao, `size-adjust` cho fonts |
| **INP** | Server Actions thay API routes, React.memo cho nodes |
| **TTFB** | MongoDB projection (chỉ lấy fields cần), connection pool |

---

## 🔄 Luồng hoạt động

### Chế độ Xem (View Mode)
```
User click node → onNodeClick() → router.push('/roadmap/[slug]/[node-slug]')
                                → Next.js serve static HTML từ CDN (nhanh!)
                                → MDX render trên server → HTML đầy đủ cho SEO
```

### Chế độ Chỉnh sửa (Edit Mode)
```
User click node → onNodeClick() → mở NodeEditModal
User sửa MD + Save → updateNodeContent() (Server Action)
                   → MongoDB update node content
                   → revalidatePath() → rebuild trang đó trên Vercel
```

### Build Flow (Production)
```
npm run build
  → generateStaticParams() gọi getAllRoadmapSlugs()
  → Tạo HTML tĩnh cho mỗi /roadmap/[slug] và /roadmap/[slug]/[node-slug]
  → Deploy lên Vercel CDN toàn cầu
  → Người dùng nhận HTML trong <100ms (LCP tốt)
```

---

## 📊 Lộ trình thực hiện (Project Roadmap)

### Phase 1: Setup & Foundation (Ngày 1-2)
- [ ] Khởi tạo Next.js 15 với TypeScript
- [ ] Cài đặt dependencies (Tailwind, Shadcn, ReactFlow...)
- [ ] Cấu hình MongoDB Atlas
- [ ] Setup Mongoose models
- [ ] Deploy lên Vercel (CI/CD từ đầu)

### Phase 2: Core Builder (Ngày 3-5)
- [ ] Custom React Flow node component
- [ ] Chế độ View: click → navigate
- [ ] Chế độ Edit: drag, add/delete node
- [ ] NodeEditModal với Markdown editor
- [ ] Save graph lên MongoDB

### Phase 3: SEO & Content (Ngày 6-8)
- [ ] generateMetadata() cho tất cả pages
- [ ] MDX rendering với syntax highlight
- [ ] JSON-LD structured data
- [ ] Sitemap.xml & robots.txt
- [ ] generateStaticParams() + ISR

### Phase 4: Polish & Deploy (Ngày 9-10)
- [ ] Loading skeletons (CLS optimization)
- [ ] Error boundaries
- [ ] Mobile responsive
- [ ] Google Search Console setup
- [ ] Performance audit (Lighthouse ≥ 90)

---

## 🧪 Kiểm tra SEO

```bash
# Build và check static pages
npm run build

# Kiểm tra sitemap
curl http://localhost:3000/sitemap.xml

# Kiểm tra JSON-LD
# → Mở DevTools → Sources → tìm <script type="application/ld+json">

# On-demand revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","slug":"frontend-web-development-2025"}'
```

---

## 📝 Ghi chú quan trọng

1. **React Flow cần `'use client'`** → Toàn bộ Builder là Client Component. Data fetch ở Server → truyền qua props.

2. **MongoDB ObjectId** → Luôn dùng `serializeDoc()` trước khi truyền từ Server → Client Component để tránh "Non-serializable values" error.

3. **Slug phải unique** → Mỗi node cần slug khác nhau trong cùng 1 roadmap. Script seed đã xử lý điều này.

4. **ISR vs SSG** → Dùng `revalidate = 3600` cho nội dung ít thay đổi. Dùng On-demand revalidation khi publish content mới.

5. **MDX Security** → `next-mdx-remote` chạy server-side, an toàn. Nhưng nên validate input Markdown trước khi save vào DB.
