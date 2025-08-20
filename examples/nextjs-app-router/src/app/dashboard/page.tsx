import { get } from '@/store'
import { ClientDashboard } from '@/components/ClientDashboard'
import type { User, Post } from '@/lib/types'

export const metadata = {
  title: 'Dashboard | Storken Next.js',
  description: 'User dashboard with hybrid server-client rendering',
}

// Hybrid Server Component that passes data to Client Component
export default async function DashboardPage() {
  // Server-side initial data fetch using Storken
  const [initialUser, initialPosts] = await Promise.all([
    get<User | null>('currentUser'),
    get<Post[]>('posts', '1') // Posts by current user
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Hybrid rendering: Server-fetched data with client-side interactivity
        </p>
      </div>

      {/* Client component with server data */}
      <ClientDashboard 
        initialUser={initialUser}
        initialPosts={initialPosts || []}
      />

      {/* Architecture Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🖥️ Server Component
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Initial data fetched on server for fast loading and SEO optimization.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <div>✅ Server-side data fetching</div>
            <div>✅ Direct database access</div>
            <div>✅ No loading states needed</div>
            <div>✅ SEO friendly</div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🌐 Client Component
          </h3>
          <p className="text-sm text-green-800 mb-3">
            Interactive features with client-side state management using Storken.
          </p>
          <div className="text-xs text-green-700 space-y-1">
            <div>✅ Real-time updates</div>
            <div>✅ Optimistic updates</div>
            <div>✅ Interactive UI</div>
            <div>✅ Client-side routing</div>
          </div>
        </div>
      </div>
    </div>
  )
}