# St. Refka Church Media Center

A modern, comprehensive media platform designed for St. Refka Church to manage and share spiritual content, sermons, bible studies, and events. This Progressive Web App (PWA) offers a seamless experience on both desktop and mobile devices, with full support for English and Arabic languages.

## ✨ Features

- **📱 Progressive Web App (PWA)**: Installable on mobile and desktop, works offline with caching strategies.
- **🌍 Bilingual Support**: Complete Arabic and English support with RTL layout and custom 'Cairo' font for Arabic.
- **🎥 Media Library**: Categorized video content (Sermons, Liturgies, Bible Studies, Kids, etc.).
- **🔍 Advanced Search & Filter**: Real-time search by title/description and category filtering.
- **❤️ Favorites & Watch Later**: Users can bookmark videos to their personal "Favorites" list (persisted locally).
- **💬 Comments System**: Interactive community engagement on videos.
- **👍 Likes & Engagement**: Social features to like videos and share them via WhatsApp, Facebook, etc.
- **🛡️ Admin Dashboard**:
  - Secure role-based access control (Admin/User).
  - User management (Promote/Demote/Delete).
  - Add/Remove videos via UI.
- **🎨 Modern UI/UX**: Premium dark/light themes, smooth animations (Framer Motion), and responsive design.

## 🛠️ Tech Stack

- **Frontend Builder**: [Vite](https://vitejs.dev/)
- **Framework**: [React 19](https://react.dev/) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Auth, Database, Realtime)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/st-refka-media-center.git
   cd st-refka-media-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_VAPID_PUBLIC_KEY=your_vapid_key_for_notifications (optional)
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup (Supabase)

Run the following SQL scripts in your Supabase SQL Editor to set up the necessary tables and triggers.

### 1. Create Tables

```sql
-- Profiles table (extends Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Media Items
create table public.media_items (
  id uuid default gen_random_uuid() primary key,
  youtube_id text not null,
  title text not null,
  description text,
  category text,
  thumbnail_url text,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments
create table public.video_comments (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references public.media_items(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Likes
create table public.video_likes (
  video_id uuid references public.media_items(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (video_id, user_id)
);
```

### 2. Auto-Create Profiles Trigger

Important for user management and comments to work correctly.

```sql
-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger triggers on sign up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Row Level Security (RLS)

Enable RLS on all tables and add appropriate policies.

```sql
-- Example: Allow public read access to media items
alter table public.media_items enable row level security;
create policy "Public items are viewable by everyone" on public.media_items for select using (true);
```

## 📱 PWA Information

The application is PWA-ready.
- **Manifest**: Located in `public/manifest.json`.
- **Service Worker**: `public/sw.js` handles caching assets for offline use.
- **Assets**: App icons are stored in `public/icons/`.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.
