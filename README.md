# 🗺️ Interactive Roadmap Builder

Ứng dụng web xây dựng lộ trình học tập trực quan với **kéo thả**, nội dung Markdown, **Blog tích hợp**, **Ghi chú cá nhân**, và tối ưu **SEO mạnh mẽ**.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js v4 (GitHub OAuth) |
| Kéo thả | React Flow v11 |
| UI | Tailwind CSS v3 + Shadcn/UI |
| Content | next-mdx-remote (Markdown/MDX → React) |
| ID ngắn | nanoid |
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
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roadmap-builder

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Interactive Roadmap Builder"

# On-demand ISR (tạo bằng: openssl rand -hex 32)
REVALIDATION_SECRET=your-secret-here

# GitHub OAuth — xem hướng dẫn bên dưới
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# NextAuth (tạo bằng: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

#### Tạo GitHub OAuth App

1. Vào [https://github.com/settings/developers](https://github.com/settings/developers)
2. Nhấn **New OAuth App**
3. Điền:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** và tạo **Client Secret** → dán vào `.env.local`

### 3. Seed dữ liệu mẫu

```bash
npx tsx scripts/seed.ts
```

Lệnh này tạo:
- 1 **Roadmap** mẫu (Frontend 2025) với 5 nodes
- 1 **Blog post** mẫu (kèm related roadmap)
- 1 **Content** mẫu (JavaScript Async/Await)

> **Lưu ý:** Ghi chú (Notes) **không được seed** vì chúng liên kết với tài khoản người dùng đã xác thực. Tạo ghi chú sau khi đăng nhập tại `/notes/new`.

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
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx        # Trang đăng nhập GitHub OAuth
│   │
│   ├── blog/
│   │   ├── page.tsx            # Danh sách bài viết (SSG + ISR)
│   │   ├── loading.tsx         # Skeleton loading
│   │   ├── error.tsx           # Error boundary
│   │   ├── new/
│   │   │   └── page.tsx        # Form tạo bài viết mới
│   │   └── [blog-slug]/
│   │       ├── page.tsx        # Trang bài viết (SSG + ISR + JSON-LD)
│   │       ├── edit/
│   │       │   └── page.tsx    # Form chỉnh sửa bài viết
│   │       └── loading.tsx
│   │
│   ├── roadmap/
│   │   └── [roadmap-slug]/
│   │       ├── page.tsx        # Trang Roadmap (SSG + ISR)
│   │       ├── loading.tsx     # Skeleton loading
│   │       ├── error.tsx       # Error boundary
│   │       └── [node-slug]/
│   │           ├── page.tsx    # Trang bài học chi tiết (SEO)
│   │           └── loading.tsx
│   │
│   ├── content/
│   │   ├── page.tsx            # Thư viện nội dung (+ nút "Thêm mới")
│   │   ├── loading.tsx
│   │   ├── error.tsx           # Error boundary
│   │   ├── new/
│   │   │   └── page.tsx        # Form tạo Content mới
│   │   └── [content-slug]/
│   │       ├── page.tsx        # Trang content chi tiết
│   │       ├── edit/
│   │       │   └── page.tsx    # Form chỉnh sửa content
│   │       └── loading.tsx
│   │
│   ├── notes/
│   │   ├── page.tsx            # Danh sách ghi chú (yêu cầu đăng nhập)
│   │   ├── new/
│   │   │   └── page.tsx        # Form tạo ghi chú mới
│   │   └── [note-slug]/
│   │       ├── page.tsx        # Trang ghi chú chi tiết (chỉ chủ sở hữu)
│   │       └── edit/
│   │           └── page.tsx    # Form chỉnh sửa ghi chú
│   │
│   ├── dashboard/
│   │   ├── page.tsx            # Server wrapper (lấy session + data)
│   │   └── DashboardClient.tsx # Client component – 4 tab quản lý
│   │
│   ├── builder/
│   │   └── new/
│   │       └── page.tsx        # Form tạo Roadmap mới
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts    # NextAuth handler (GitHub OAuth)
│       └── revalidate/
│           └── route.ts        # On-demand ISR revalidation
│
├── actions/
│   ├── roadmap.ts              # CRUD Roadmap + togglePublish + share
│   ├── content.ts              # CRUD Content Library
│   ├── post.ts                 # CRUD Blog Posts
│   └── note.ts                 # CRUD Notes (private, owner-only)
│
├── components/
│   ├── NavBar.tsx              # Global navigation bar (sticky, active route)
│   ├── SessionProvider.tsx     # NextAuth SessionProvider wrapper
│   ├── RoadmapBuilder.tsx      # Client: React Flow canvas + publish toggle
│   ├── CustomRoadmapNode.tsx   # Custom node UI
│   ├── NodeEditModal.tsx       # Modal chỉnh sửa Markdown (3 tabs)
│   ├── ShareModal.tsx          # Modal chia sẻ & collaborators roadmap
│   ├── FloatingMenu.tsx        # Floating action menu (tạo nhanh)
│   ├── JsonLd.tsx              # Structured Data (Schema.org)
│   ├── CreateRoadmapForm.tsx   # Form tạo Roadmap mới
│   ├── CreatePostForm.tsx      # Form tạo Blog Post
│   ├── EditPostForm.tsx        # Form chỉnh sửa Blog Post
│   ├── CreateContentForm.tsx   # Form tạo Content Library item
│   ├── EditContentForm.tsx     # Form chỉnh sửa Content
│   ├── CreateNoteForm.tsx      # Form tạo / chỉnh sửa Ghi chú
│   ├── BlogCardActions.tsx     # Actions cho card bài viết (edit/delete)
│   ├── ContentCardActions.tsx  # Actions cho card content
│   ├── ContentDetailActions.tsx# Actions trên trang chi tiết content
│   ├── NoteCardActions.tsx     # Actions cho card ghi chú (pin/edit/delete)
│   ├── NoteDetailActions.tsx   # Actions trên trang chi tiết ghi chú
│   └── PostDetailActions.tsx   # Actions trên trang chi tiết bài viết
│
├── lib/
│   ├── auth.ts                 # NextAuth config (GitHub provider + callbacks)
│   ├── mongodb.ts              # MongoDB singleton (Mongoose)
│   ├── mongodb-client.ts       # MongoClient singleton (NextAuth adapter)
│   └── utils.ts                # slug, excerpt, readingTime, cn(), serializeDoc()
│
├── models/
│   ├── Roadmap.ts              # Mongoose Schema: Roadmap + Node + Edge
│   ├── Content.ts              # Mongoose Schema: Content Library
│   ├── Post.ts                 # Mongoose Schema: Blog Post
│   └── Note.ts                 # Mongoose Schema: Ghi chú cá nhân
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
/content/[content-slug]/edit         → Chỉnh sửa content
/blog                                 → Danh sách bài viết blog
/blog/[blog-slug]                    → Bài viết đầy đủ (BlogPosting schema)
/blog/new                            → Form viết bài mới
/blog/[blog-slug]/edit               → Chỉnh sửa bài viết
/notes                                → Danh sách ghi chú (yêu cầu đăng nhập)
/notes/new                            → Tạo ghi chú mới
/notes/[note-slug]                    → Chi tiết ghi chú (chỉ chủ sở hữu)
/notes/[note-slug]/edit               → Chỉnh sửa ghi chú
/dashboard                            → Quản lý toàn bộ nội dung của bạn
/builder/new                          → Form tạo Roadmap mới
/auth/signin                          → Đăng nhập bằng GitHub
/guide                                → Hướng dẫn sử dụng
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
| JSON-LD BlogPosting | Trang blog → BlogPosting schema |
| OpenGraph + Twitter Card | Preview khi share mạng xã hội |
| Sitemap.xml | Tất cả trang: roadmap, node, content, blog |
| Canonical URLs | Tránh duplicate content |
| Breadcrumb markup | Path hiển thị trên Google Search |
| robots: noindex | Trang notes/dashboard không index |

---

## 🗄️ Database Schema

### Roadmap

```typescript
{
  title, slug (unique), description,
  author: { name, avatar },
  category, tags, coverImage,
  isPublished, viewCount,
  collaborators: string[],   // GitHub user IDs được phép edit
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

### Post (Blog)

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

### Note (Ghi chú cá nhân)

```typescript
{
  title, slug (unique), content (Markdown),
  color: "yellow" | "blue" | "green" | "pink" | "purple" | "default",
  isPinned: boolean,
  tags: string[],
  roadmapSlug?,    // liên kết tới roadmap nếu có
  ownerId,         // GitHub user ID của chủ sở hữu
  ownerEmail,      // Email dự phòng (backward compat)
  createdAt, updatedAt
}
```

> ⚠️ **Ghi chú luôn riêng tư.** Server Actions kiểm tra `ownerId` / `ownerEmail` trước mọi thao tác đọc/ghi. Người khác sẽ thấy trang cảnh báo 🔒 thay vì nội dung.

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

### Tạo Ghi chú
```
/notes/new → CreateNoteForm → createNote() Server Action
  → Kiểm tra session (requireAuth)
  → MongoDB insert (ownerId = session.user.id)
  → Ghi chú được gán màu, tag, isPinned
  → redirect /notes/[slug]
  → Chỉ chủ sở hữu xem/sửa/xóa được
```

### Chế độ View vs Edit (Roadmap)
```
Mode View: click node → navigate đến bài học
Mode Edit: click node → mở NodeEditModal (3 tab: Cơ bản / Nội dung / Kết nối)
Toggle publish: "Draft" ↔ "Public" không cần reload trang
Share: mở ShareModal → thêm collaborators bằng GitHub username
```

---

## 📊 Lộ trình thực hiện (Project Roadmap)

### ✅ Phase 1: Setup & Foundation
- [x] Khởi tạo Next.js 15 với TypeScript
- [x] Cài đặt dependencies (Tailwind, Shadcn, ReactFlow, nanoid...)
- [x] Cấu hình MongoDB Atlas
- [x] Setup Mongoose models (Roadmap, Content, Post, **Note**)
- [x] Deploy lên Vercel (CI/CD từ đầu)

### ✅ Phase 2: Core Builder
- [x] Custom React Flow node component
- [x] Chế độ View: click → navigate
- [x] Chế độ Edit: drag, add/delete node
- [x] NodeEditModal với Markdown editor (3 tabs)
- [x] Save graph lên MongoDB
- [x] **Publish toggle** (Draft / Public)
- [x] **ShareModal** – thêm/xóa collaborators

### ✅ Phase 3: SEO & Content
- [x] `generateMetadata()` cho tất cả pages
- [x] MDX rendering với syntax highlight
- [x] JSON-LD: Course, Article, BlogPosting
- [x] Sitemap.xml & robots.txt (cả blog + content)
- [x] `generateStaticParams()` + ISR
- [x] **Blog system** (/blog, /blog/[slug], /blog/new, /blog/[slug]/edit)
- [x] **Content Library** tái sử dụng giữa nhiều roadmap

### ✅ Phase 4: Auth & Notes
- [x] **NextAuth.js** – GitHub OAuth (`/auth/signin`)
- [x] **Notes system** – ghi chú cá nhân riêng tư (/notes/\*)
- [x] Owner-based access control (ownerId/ownerEmail)
- [x] Dashboard – quản lý tất cả nội dung 1 trang

### ✅ Phase 5: Polish & Deploy
- [x] Loading skeletons (CLS optimization) — tất cả routes kể cả homepage
- [x] **Error boundaries** — `error.tsx` cho global, roadmap, blog, content
- [x] **Global NavBar** (sticky, highlight active route)
- [x] **ReactFlow canvas height** fixed (`calc(100vh - 3.5rem)`)
- [x] Mobile responsive (Tailwind breakpoints: sm/md/lg)
- [x] **Revalidate API** — xử lý cả `roadmap` / `blog` / `content` type
- [ ] Google Search Console setup *(thêm verification code vào `layout.tsx`)*
- [ ] Performance audit (Lighthouse ≥ 90) *(chạy sau khi deploy production)*

---

## 🧪 Kiểm tra SEO

```bash
# Build và kiểm tra static pages
npm run build

# Kiểm tra sitemap
curl http://localhost:3000/sitemap.xml

# Kiểm tra JSON-LD
# DevTools → Sources → tìm <script type="application/ld+json">

# On-demand revalidation – Roadmap
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","type":"roadmap","slug":"frontend-web-development-2025"}'

# On-demand revalidation – Blog post
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","type":"blog","slug":"huong-dan-hoc-frontend-2025"}'

# On-demand revalidation – Content
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","type":"content","slug":"javascript-async-await"}'
```

---

## 📝 Ghi chú quan trọng

1. **React Flow cần `'use client'`** — Toàn bộ Builder là Client Component. Data fetch ở Server → truyền qua props.

2. **MongoDB ObjectId** — Luôn dùng `serializeDoc()` trước khi truyền từ Server → Client Component để tránh "Non-serializable values" error.

3. **Blog vs Content Library**:
   - `Blog Post` (/blog/[slug]): bài viết có tác giả, ngày đăng, ảnh bìa, `relatedRoadmaps`. Phù hợp cho tutorial, guide, tips.
   - `Content Library` (/content/[slug]): nội dung kỹ thuật thuần túy, gắn trực tiếp vào node qua `contentSlug`.

4. **Notes vs Blog**:
   - `Note` (/notes/[slug]): **luôn riêng tư**, chỉ chủ sở hữu xem được, không index SEO, hỗ trợ màu sắc và ghim.
   - `Blog Post`: có thể public hoặc nháp, hỗ trợ SEO đầy đủ.

5. **Publish workflow**: Roadmap tạo mới mặc định là `Draft`. Nhấn "Xuất bản" trong editor để public. Blog post có toggle publish ngay trên form.

6. **Auth & Session**: `getServerSession(authOptions)` dùng trong Server Components và Server Actions. Client Components dùng `useSession()` từ NextAuth.

7. **ISR vs SSG** — Dùng `revalidate = 3600` cho nội dung ít thay đổi. Dùng On-demand revalidation khi publish content mới. Notes dùng `force-dynamic` vì luôn cần session mới nhất.

8. **MDX Security** — `next-mdx-remote` chạy server-side, an toàn. Nhưng nên validate input Markdown trước khi save vào DB.

9. **Canvas height** — RoadmapBuilder dùng `height: calc(100vh - 3.5rem)` để trừ đi chiều cao NavBar (3.5rem = 56px).
