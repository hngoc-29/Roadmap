# 🗺️ Interactive Roadmap Builder

Ứng dụng web xây dựng lộ trình học tập trực quan với **kéo thả**, nội dung Markdown, **Blog tích hợp**, và tối ưu **SEO mạnh mẽ**.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Kéo thả | React Flow v11 |
| UI | Tailwind CSS v3 + Shadcn/UI |
| Content | next-mdx-remote (Markdown/MDX → React) |
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

Lệnh này tạo:
- 1 **Roadmap** mẫu (Frontend 2025) với 5 nodes
- 1 **Blog post** mẫu (kèm related roadmap)
- 1 **Content** mẫu (JavaScript Async/Await)

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
│   ├── layout.tsx              # Root layout + NavBar + default SEO
│   ├── page.tsx                # Trang chủ – danh sách roadmaps
│   ├── sitemap.ts              # Dynamic sitemap.xml (roadmap + blog + content)
│   ├── robots.ts               # robots.txt
│   ├── not-found.tsx           # Custom 404
│   │
│   ├── blog/
│   │   ├── page.tsx            # ✅ Danh sách bài viết (SSG + ISR)
│   │   ├── loading.tsx         # Skeleton loading
│   │   ├── new/
│   │   │   └── page.tsx        # Form tạo bài viết mới
│   │   └── [blog-slug]/
│   │       ├── page.tsx        # ✅ Trang bài viết (SSG + ISR + JSON-LD)
│   │       └── loading.tsx
│   │
│   ├── roadmap/
│   │   └── [roadmap-slug]/
│   │       ├── page.tsx        # ✅ Trang Roadmap (SSG + ISR)
│   │       ├── loading.tsx     # Skeleton loading
│   │       └── [node-slug]/
│   │           ├── page.tsx    # ✅ Trang bài học chi tiết (SEO)
│   │           └── loading.tsx
│   │
│   ├── content/
│   │   ├── page.tsx            # Thư viện nội dung
│   │   ├── loading.tsx
│   │   └── [content-slug]/
│   │       ├── page.tsx        # ✅ Trang content chi tiết
│   │       └── loading.tsx
│   │
│   ├── builder/
│   │   └── new/
│   │       └── page.tsx        # Form tạo Roadmap mới
│   │
│   └── api/
│       └── revalidate/route.ts # On-demand ISR revalidation
│
├── actions/
│   ├── roadmap.ts              # CRUD Roadmap + togglePublish
│   ├── content.ts              # CRUD Content Library
│   └── post.ts                 # ✅ CRUD Blog Posts
│
├── components/
│   ├── NavBar.tsx              # ✅ Global navigation bar
│   ├── RoadmapBuilder.tsx      # Client: React Flow canvas + publish toggle
│   ├── CustomRoadmapNode.tsx   # Custom node UI
│   ├── NodeEditModal.tsx       # Modal chỉnh sửa Markdown (3 tabs)
│   ├── JsonLd.tsx              # Structured Data (Schema.org)
│   ├── CreateRoadmapForm.tsx   # ✅ Form tạo Roadmap mới
│   └── CreatePostForm.tsx      # ✅ Form tạo Blog Post
│
├── lib/
│   ├── mongodb.ts              # MongoDB singleton connection
│   └── utils.ts                # slug, excerpt, readingTime, cn()
│
├── models/
│   ├── Roadmap.ts              # Mongoose Schema: Roadmap + Node + Edge
│   ├── Content.ts              # Mongoose Schema: Content Library
│   └── Post.ts                 # ✅ Mongoose Schema: Blog Post
│
└── types/
    └── index.ts                # TypeScript interfaces (IRoadmap, IContent, IPost)
```

---

## 🌐 URL Structure & SEO

```
/                                      → Trang chủ – danh sách roadmaps
/roadmap/[roadmap-slug]               → Xem/Edit roadmap (React Flow canvas)
/roadmap/[roadmap-slug]/[node-slug]   → Trang bài học chi tiết
/content                              → Thư viện nội dung độc lập
/content/[content-slug]              → Trang nội dung (có backlinks)
/blog                                 → ✅ Danh sách bài viết blog
/blog/[blog-slug]                    → ✅ Bài viết đầy đủ (BlogPosting schema)
/blog/new                            → ✅ Form viết bài mới
/builder/new                          → Form tạo Roadmap mới
/sitemap.xml                          → Tự động generate (tất cả pages)
/robots.txt                           → Tự động generate
```

### SEO Features đã triển khai

| Feature | Mô tả |
|---------|-------|
| `generateMetadata()` | Metadata động từ MongoDB cho mỗi trang |
| `generateStaticParams()` | SSG cho roadmap, node, content, blog |
| ISR (60s – 3600s) | Tự động rebuild khi content thay đổi |
| On-demand revalidation | `/api/revalidate` khi publish |
| JSON-LD Course | Trang roadmap → Course schema |
| JSON-LD Article | Trang node → Article schema |
| JSON-LD BlogPosting | ✅ Trang blog → BlogPosting schema |
| OpenGraph + Twitter Card | Preview khi share mạng xã hội |
| Sitemap.xml | Tất cả trang: roadmap, node, content, blog |
| Canonical URLs | Tránh duplicate content |
| Breadcrumb markup | Path hiển thị trên Google Search |

---

## 🗄️ Database Schema

### Roadmap

```typescript
{
  title, slug (unique), description,
  author: { name, avatar },
  category, tags, coverImage,
  isPublished, viewCount,
  nodes: [{
    id, type, position: { x, y },
    data: {
      label, slug, content (Markdown),
      contentSlug?,   // link tới Content collection
      description, status, icon,
      estimatedTime, difficulty, tags, resources
    }
  }],
  edges: [{ id, source, target, type, animated }]
}
```

### Content (Library)

```typescript
{
  title, slug (unique), content (Markdown),
  description, tags, difficulty,
  estimatedTime, icon, resources
}
```

### Post (Blog) ✅ MỚI

```typescript
{
  title, slug (unique), content (Markdown),
  description, coverImage,
  author: { name, avatar },
  category, tags,
  relatedRoadmaps: string[],  // slugs của roadmap liên quan
  resources, isPublished, publishedAt, viewCount
}
```

---

## 🔄 Luồng hoạt động

### Tạo Roadmap mới
```
/builder/new → CreateRoadmapForm → createRoadmap() Server Action
  → MongoDB insert (isPublished: false)
  → redirect /roadmap/[slug] (editor mode)
  → Thêm nodes, kéo thả, chỉnh sửa
  → Click "Xuất bản" → togglePublishRoadmap()
  → revalidatePath() → HTML mới được build
```

### Viết Blog Post
```
/blog/new → CreatePostForm → createPost() Server Action
  → MongoDB insert
  → redirect /blog/[slug]
  → Gắn relatedRoadmaps → hiển thị ở sidebar bài viết
```

### Tái sử dụng Content
```
Tạo Content tại /content → slug: "javascript-async-await"
Node A trong Roadmap 1 → contentSlug = "javascript-async-await"
Node B trong Roadmap 2 → contentSlug = "javascript-async-await"
  → Cả 2 node đều navigate đến /content/javascript-async-await
  → Sidebar hiển thị backlinks: "Có trong 2 Roadmaps"
```

### Chế độ View vs Edit
```
Mode View: click node → navigate đến bài học
Mode Edit: click node → mở NodeEditModal (3 tab: Cơ bản / Nội dung / Kết nối)
Toggle publish: "Draft" ↔ "Public" không cần reload trang
```

---

## 📊 Lộ trình thực hiện (Project Roadmap)

### ✅ Phase 1: Setup & Foundation
- [x] Khởi tạo Next.js 15 với TypeScript
- [x] Cài đặt dependencies (Tailwind, Shadcn, ReactFlow...)
- [x] Cấu hình MongoDB Atlas
- [x] Setup Mongoose models (Roadmap, Content, **Post**)
- [x] Deploy lên Vercel (CI/CD từ đầu)

### ✅ Phase 2: Core Builder
- [x] Custom React Flow node component
- [x] Chế độ View: click → navigate
- [x] Chế độ Edit: drag, add/delete node
- [x] NodeEditModal với Markdown editor (3 tabs)
- [x] Save graph lên MongoDB
- [x] **Publish toggle** (Draft / Public)

### ✅ Phase 3: SEO & Content
- [x] `generateMetadata()` cho tất cả pages
- [x] MDX rendering với syntax highlight
- [x] JSON-LD: Course, Article, **BlogPosting**
- [x] Sitemap.xml & robots.txt (cả blog + content)
- [x] `generateStaticParams()` + ISR
- [x] **Blog system** (/blog, /blog/[slug], /blog/new)
- [x] **Content Library** tái sử dụng giữa nhiều roadmap

### ✅ Phase 4: Polish & Deploy
- [x] Loading skeletons (CLS optimization) — tất cả routes
- [x] **Global NavBar** (sticky, highlight active route)
- [x] **Error boundaries** (not-found.tsx)
- [x] **ReactFlow canvas height** fixed (100vh - navbar)
- [x] Mobile responsive
- [ ] Google Search Console setup *(cần NEXT_PUBLIC_APP_URL production)*
- [ ] Performance audit (Lighthouse ≥ 90)

---

## 🧪 Kiểm tra SEO

```bash
# Build và kiểm tra static pages
npm run build

# Kiểm tra sitemap
curl http://localhost:3000/sitemap.xml

# Kiểm tra JSON-LD
# DevTools → Sources → tìm <script type="application/ld+json">

# On-demand revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","slug":"frontend-web-development-2025"}'
```

---

## 📝 Ghi chú quan trọng

1. **React Flow cần `'use client'`** — Toàn bộ Builder là Client Component. Data fetch ở Server → truyền qua props.

2. **MongoDB ObjectId** — Luôn dùng `serializeDoc()` trước khi truyền từ Server → Client Component để tránh "Non-serializable values" error.

3. **Blog vs Content Library**:
   - `Blog Post` (/blog/[slug]): bài viết có tác giả, ngày đăng, ảnh bìa, `relatedRoadmaps`. Phù hợp cho tutorial, guide, tips.
   - `Content Library` (/content/[slug]): nội dung kỹ thuật thuần túy, gắn trực tiếp vào node qua `contentSlug`.

4. **Publish workflow**: Roadmap tạo mới mặc định là `Draft`. Nhấn "Xuất bản" trong editor để public. Blog post có toggle publish ngay trên form.

5. **ISR vs SSG** — Dùng `revalidate = 3600` cho nội dung ít thay đổi. Dùng On-demand revalidation khi publish content mới.

6. **MDX Security** — `next-mdx-remote` chạy server-side, an toàn. Nhưng nên validate input Markdown trước khi save vào DB.

7. **Canvas height** — RoadmapBuilder dùng `height: calc(100vh - 3.5rem)` để trừ đi chiều cao NavBar (3.5rem = 56px).
