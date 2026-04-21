// ============================================================
// SCRIPTS/SEED.TS - Seed MongoDB với dữ liệu mẫu
// ============================================================
// Chạy: npx tsx scripts/seed.ts

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");

const RoadmapSchema = new mongoose.Schema({}, { strict: false });
const Roadmap = mongoose.models.Roadmap ?? mongoose.model("Roadmap", RoadmapSchema);

const PostSchema = new mongoose.Schema({}, { strict: false });
const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);

const ContentSchema = new mongoose.Schema({}, { strict: false });
const Content = mongoose.models.Content ?? mongoose.model("Content", ContentSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  await Promise.all([
    Roadmap.deleteMany({}),
    Post.deleteMany({}),
    Content.deleteMany({}),
  ]);
  console.log("🗑️  Cleared old data");

  // ── Seed Roadmap ──
  const roadmap = await Roadmap.create({
    title: "Lộ trình học Frontend Web Development 2025",
    slug: "frontend-web-development-2025",
    description: "Lộ trình học Frontend từ cơ bản đến nâng cao: HTML, CSS, JavaScript, React, Next.js và các công cụ hiện đại.",
    author: { name: "Roadmap Builder Team", avatar: "" },
    category: "Frontend",
    tags: ["html", "css", "javascript", "react", "nextjs", "typescript"],
    isPublished: true,
    viewCount: 1247,
    nodes: [
      {
        id: "node-1",
        type: "roadmapNode",
        position: { x: 300, y: 50 },
        data: {
          label: "HTML Cơ bản",
          slug: "html-co-ban",
          icon: "🌐",
          description: "Học nền tảng HTML: cấu trúc trang web, semantic tags",
          content: `# HTML Cơ bản\n\nHTML (HyperText Markup Language) là ngôn ngữ đánh dấu chuẩn để tạo trang web.\n\n## Nội dung cần học\n\n- Cấu trúc tài liệu HTML\n- Các thẻ semantic: \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`\n- Forms và inputs\n- Accessibility (ARIA)\n\n## Bài tập\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <meta charset="UTF-8">\n  <title>Trang đầu tiên</title>\n</head>\n<body>\n  <h1>Xin chào thế giới!</h1>\n</body>\n</html>\n\`\`\``,
          status: "completed",
          difficulty: "beginner",
          estimatedTime: "1 tuần",
          tags: ["html", "web"],
        },
      },
      {
        id: "node-2",
        type: "roadmapNode",
        position: { x: 100, y: 200 },
        data: {
          label: "CSS & Flexbox",
          slug: "css-va-flexbox",
          icon: "🎨",
          description: "Styling với CSS, Flexbox, Grid Layout",
          content: `# CSS & Flexbox\n\nCSS giúp bạn kiểm soát giao diện của trang web.\n\n## Flexbox\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}\n\`\`\`\n\n## Grid\n\n\`\`\`css\n.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}\n\`\`\``,
          status: "active",
          difficulty: "beginner",
          estimatedTime: "2 tuần",
          tags: ["css", "flexbox", "grid"],
        },
      },
      {
        id: "node-3",
        type: "roadmapNode",
        position: { x: 500, y: 200 },
        data: {
          label: "JavaScript ES6+",
          slug: "javascript-es6-plus",
          icon: "⚡",
          description: "JavaScript hiện đại: arrow functions, async/await, modules",
          content: `# JavaScript ES6+\n\nJavaScript là ngôn ngữ lập trình của web.\n\n## Arrow Functions\n\n\`\`\`javascript\nconst greet = (name) => \`Xin chào, \${name}!\`;\n\`\`\`\n\n## Async/Await\n\n\`\`\`javascript\nconst fetchData = async () => {\n  const response = await fetch('/api/data');\n  const data = await response.json();\n  return data;\n};\n\`\`\``,
          status: "available",
          difficulty: "intermediate",
          estimatedTime: "3 tuần",
          tags: ["javascript", "es6"],
        },
      },
      {
        id: "node-4",
        type: "roadmapNode",
        position: { x: 300, y: 380 },
        data: {
          label: "React.js",
          slug: "reactjs-co-ban",
          icon: "⚛️",
          description: "Xây dựng UI với React: components, hooks, state management",
          content: `# React.js\n\nReact là thư viện JavaScript để xây dựng UI.\n\n## Component cơ bản\n\n\`\`\`jsx\nfunction Button({ label, onClick }) {\n  return (\n    <button onClick={onClick}>\n      {label}\n    </button>\n  );\n}\n\`\`\`\n\n## useState Hook\n\n\`\`\`jsx\nconst [count, setCount] = useState(0);\n\`\`\``,
          status: "locked",
          difficulty: "intermediate",
          estimatedTime: "4 tuần",
          prerequisites: ["javascript-es6-plus"],
          tags: ["react", "javascript", "ui"],
        },
      },
      {
        id: "node-5",
        type: "roadmapNode",
        position: { x: 300, y: 540 },
        data: {
          label: "Next.js & TypeScript",
          slug: "nextjs-va-typescript",
          icon: "🚀",
          description: "Full-stack React với Next.js, TypeScript, và deployment",
          content: `# Next.js & TypeScript\n\nNext.js là React framework cho production.\n\n## App Router\n\n\`\`\`tsx\n// app/page.tsx\nexport default function HomePage() {\n  return <h1>Xin chào!</h1>;\n}\n\`\`\`\n\n## Server Component\n\n\`\`\`tsx\nasync function getData() {\n  const data = await db.find();\n  return data;\n}\n\`\`\``,
          status: "locked",
          difficulty: "advanced",
          estimatedTime: "5 tuần",
          prerequisites: ["reactjs-co-ban"],
          tags: ["nextjs", "typescript", "fullstack"],
        },
      },
    ],
    edges: [
      { id: "e1-2", source: "node-1", target: "node-2", type: "smoothstep" },
      { id: "e1-3", source: "node-1", target: "node-3", type: "smoothstep" },
      { id: "e2-4", source: "node-2", target: "node-4", type: "smoothstep" },
      { id: "e3-4", source: "node-3", target: "node-4", type: "smoothstep", animated: true },
      { id: "e4-5", source: "node-4", target: "node-5", type: "smoothstep", animated: true },
    ],
  });
  console.log(`✅ Roadmap: "${roadmap.title}" (${roadmap.nodes.length} nodes)`);

  // ── Seed Blog Post ──
  const post = await Post.create({
    title: "Hướng dẫn học Frontend từ A đến Z năm 2025",
    slug: "huong-dan-hoc-frontend-2025",
    description: "Lộ trình học Frontend hoàn chỉnh từ HTML/CSS cơ bản đến React, Next.js và TypeScript. Phù hợp cho người mới bắt đầu.",
    content: `# Hướng dẫn học Frontend từ A đến Z\n\nNăm 2025, Frontend development đã có nhiều thay đổi. Bài viết này sẽ hướng dẫn bạn từng bước từ cơ bản đến nâng cao.\n\n## 1. HTML & CSS Cơ bản\n\nBắt đầu với HTML và CSS. Đây là nền tảng không thể bỏ qua.\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="vi">\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n\`\`\`\n\n## 2. JavaScript ES6+\n\nHọc JavaScript hiện đại với arrow functions, destructuring, modules.\n\n## 3. React.js\n\nReact là thư viện phổ biến nhất hiện nay cho việc xây dựng UI.\n\n## 4. Next.js\n\nNext.js giúp bạn build production-ready apps với SSR, SSG và API routes.\n\n## Kết luận\n\nHãy học từng bước và thực hành nhiều. Chúc bạn thành công!`,
    author: { name: "Roadmap Builder Team" },
    category: "Guide",
    tags: ["frontend", "html", "css", "javascript", "react", "nextjs"],
    relatedRoadmaps: ["frontend-web-development-2025"],
    isPublished: true,
    publishedAt: new Date(),
    viewCount: 342,
  });
  console.log(`✅ Blog Post: "${post.title}"`);

  // ── Seed Content ──
  const content = await Content.create({
    title: "JavaScript Async/Await toàn tập",
    slug: "javascript-async-await",
    description: "Hiểu sâu về async/await trong JavaScript: từ callback, Promise đến async/await hiện đại.",
    content: `# JavaScript Async/Await\n\n## Callback Hell\n\nTrước khi có Promise, chúng ta phải dùng callback:\n\n\`\`\`javascript\ngetUser(id, (user) => {\n  getPosts(user.id, (posts) => {\n    getComments(posts[0].id, (comments) => {\n      console.log(comments);\n    });\n  });\n});\n\`\`\`\n\n## Promise\n\n\`\`\`javascript\ngetUser(id)\n  .then(user => getPosts(user.id))\n  .then(posts => getComments(posts[0].id))\n  .then(comments => console.log(comments))\n  .catch(err => console.error(err));\n\`\`\`\n\n## Async/Await\n\n\`\`\`javascript\nasync function loadData(id) {\n  try {\n    const user = await getUser(id);\n    const posts = await getPosts(user.id);\n    const comments = await getComments(posts[0].id);\n    return comments;\n  } catch (err) {\n    console.error(err);\n  }\n}\n\`\`\``,
    icon: "⚡",
    difficulty: "intermediate",
    estimatedTime: "2 giờ",
    tags: ["javascript", "async", "promise", "es6"],
  });
  console.log(`✅ Content: "${content.title}"`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  console.log(`\n🌐 Roadmap: ${appUrl}/roadmap/${roadmap.slug}`);
  console.log(`📝 Blog:    ${appUrl}/blog/${post.slug}`);
  console.log(`📚 Content: ${appUrl}/content/${content.slug}`);

  await mongoose.disconnect();
  console.log("\n👋 Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
