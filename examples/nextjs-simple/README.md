# Simple Next.js + Storken Example

A basic Next.js 14+ App Router example demonstrating Storken state management integration.

## Features

- 🚀 Next.js 14+ App Router
- ⚡ Storken v3.0 state management
- 💾 localStorage persistence
- 🎨 Tailwind CSS styling
- 📱 Responsive design
- 🔄 Async data fetching with loading states

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Components

### Counter Component
- Basic state management with increment/decrement
- Functional state updates
- Reset functionality

### User Profile Component
- Login/logout functionality
- localStorage persistence using Storken getters/setters
- Form handling

### Posts List Component
- Async data fetching with mock API
- Loading states
- Manual refresh functionality

## Code Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Counter.tsx         # Counter component
│   ├── UserProfile.tsx     # User profile with login
│   └── PostsList.tsx       # Posts with async loading
└── store/
    └── store.ts            # Storken stores configuration
```

## Key Storken Features Demonstrated

### Basic State Management
```typescript
const [count, setCount] = useCounter('count', 0)
```

### Async Data Fetching
```typescript
const [posts, setPosts, , loading, refresh] = usePosts('posts', [])
```

### Persistent State with Getters/Setters
```typescript
getters: {
  user: async () => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  }
},
setters: {
  user: async (storken, user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }
}
```

## Building for Production

```bash
npm run build
npm run start
```

---

*This example shows how to integrate Storken with Next.js App Router for modern React applications.*