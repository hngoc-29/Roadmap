// ============================================================
// APP/GUIDE/INSTALL/PAGE.TSX — Hướng dẫn cài đặt & cấu hình
// ============================================================

import type { Metadata } from "next";
import { Step, Card, InfoBox, PageNav } from "../_components";

export const metadata: Metadata = {
  title: "Cài đặt & Cấu hình",
  description: "Hướng dẫn cài đặt môi trường, cấu hình biến môi trường MongoDB và GitHub OAuth.",
};

export default function InstallPage() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚙️</span>
          <h2 className="text-2xl font-bold">Cài đặt & Cấu hình</h2>
        </div>
        <p className="text-muted-foreground">
          Thiết lập môi trường phát triển local và deploy lên Vercel.
        </p>
      </div>

      {/* Yêu cầu hệ thống */}
      <div>
        <h3 className="text-lg font-semibold mb-4">📋 Yêu cầu hệ thống</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "⚡", name: "Node.js", version: "≥ 18.x" },
            { icon: "📦", name: "npm",     version: "≥ 9.x" },
            { icon: "🍃", name: "MongoDB", version: "Atlas hoặc local" },
            { icon: "🐙", name: "GitHub",  version: "OAuth App" },
          ].map(({ icon, name, version }) => (
            <Card key={name} className="text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{version}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bước cài đặt */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🛠️ Các bước cài đặt</h3>
        <div className="border-l-2 border-border ml-3 space-y-0">
          <Step number={1} title="Clone repository">
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`git clone https://github.com/your-username/roadmap-builder.git
cd roadmap-builder
npm install`}</pre>
          </Step>

          <Step number={2} title="Tạo file .env.local">
            Sao chép file mẫu và điền thông tin:
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`cp .env.example .env.local`}</pre>
          </Step>

          <Step number={3} title="Cấu hình MongoDB">
            Tạo cluster miễn phí trên{" "}
            <a href="https://mongodb.com/atlas" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              MongoDB Atlas
            </a>{" "}
            và lấy connection string:
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadmap`}</pre>
          </Step>

          <Step number={4} title="Tạo GitHub OAuth App">
            Vào{" "}
            <a href="https://github.com/settings/developers" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub → Settings → Developer settings → OAuth Apps
            </a>
            {" "}và tạo app mới:
            <div className="mt-2 space-y-1 text-xs">
              <p>• <strong>Homepage URL:</strong> <code className="bg-muted px-1.5 py-0.5 rounded font-mono">http://localhost:3000</code></p>
              <p>• <strong>Authorization callback URL:</strong> <code className="bg-muted px-1.5 py-0.5 rounded font-mono">http://localhost:3000/api/auth/callback/github</code></p>
            </div>
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret`}</pre>
          </Step>

          <Step number={5} title="Cấu hình NextAuth">
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string`}</pre>
            Để tạo secret ngẫu nhiên:
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-1 overflow-x-auto">{`openssl rand -base64 32`}</pre>
          </Step>

          <Step number={6} title="Chạy ứng dụng">
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`npm run dev`}</pre>
            Truy cập{" "}
            <a href="http://localhost:3000" className="text-primary hover:underline">http://localhost:3000</a>
          </Step>
        </div>
      </div>

      {/* .env.local đầy đủ */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📄 File .env.local đầy đủ</h3>
        <pre className="bg-muted border border-border rounded-xl px-5 py-4 text-xs font-mono overflow-x-auto leading-relaxed">{`# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadmap

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here`}</pre>
      </div>

      {/* Deploy Vercel */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🚀 Deploy lên Vercel</h3>
        <div className="border-l-2 border-border ml-3 space-y-0">
          <Step number={1} title="Push code lên GitHub">
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`git add . && git commit -m "initial" && git push`}</pre>
          </Step>
          <Step number={2} title="Import project trên Vercel">
            Vào{" "}
            <a href="https://vercel.com/new" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">vercel.com/new</a>
            {" "}→ Import từ GitHub → chọn repo.
          </Step>
          <Step number={3} title="Thêm Environment Variables">
            Trong Vercel dashboard, vào <strong>Settings → Environment Variables</strong> và thêm tất cả các biến từ file .env.local.
            Đổi <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">NEXTAUTH_URL</code> thành domain Vercel của bạn.
          </Step>
          <Step number={4} title="Cập nhật GitHub OAuth callback">
            Trong GitHub OAuth App, thêm callback URL mới:
            <pre className="bg-muted border border-border rounded-lg px-4 py-3 text-xs font-mono mt-2 overflow-x-auto">{`https://your-app.vercel.app/api/auth/callback/github`}</pre>
          </Step>
        </div>
      </div>

      <InfoBox type="warning">
        <strong>Lưu ý về giới hạn Vercel:</strong> Vercel giới hạn request body tối đa 4.5MB.
        Tất cả tính năng <strong>import file</strong> trong ứng dụng đều xử lý client-side (FileReader API)
        — không upload lên server — nên không bị ảnh hưởng bởi giới hạn này.
      </InfoBox>

      <PageNav
        prev={{ href: "/guide", label: "Tổng quan" }}
        next={{ href: "/guide/roadmap", label: "Tạo Roadmap" }}
      />
    </div>
  );
}
