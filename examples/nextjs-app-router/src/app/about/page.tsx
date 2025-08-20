import Link from 'next/link'

export const metadata = {
  title: 'About | Storken Next.js',
  description: 'Learn about this Next.js App Router example with Storken state management',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        About This Example
      </h1>

      <div className="space-y-8">
        <section className="card">
          <h2 className="text-2xl font-semibold mb-4">What This Demonstrates</h2>
          <p className="text-gray-600 mb-4">
            This Next.js App Router example showcases how Storken provides unified state management 
            across Server and Client Components, enabling developers to use the same API everywhere 
            while maintaining optimal performance and developer experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-900">🖥️ Server Components</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Direct database access</li>
                <li>• Zero client-side JavaScript</li>
                <li>• SEO optimized</li>
                <li>• Fast initial page loads</li>
                <li>• Automatic revalidation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-900">🌐 Client Components</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Interactive user interfaces</li>
                <li>• Optimistic updates</li>
                <li>• Real-time state management</li>
                <li>• API integration</li>
                <li>• Progressive enhancement</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-semibold mb-4">Architecture Overview</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Universal Store Pattern</h3>
              <p className="text-gray-600 mb-3">
                The same Storken API automatically selects the appropriate implementation 
                based on the environment:
              </p>
              <div className="bg-gray-50 p-4 rounded-md text-sm">
                <div className="text-blue-800 mb-2">🖥️ Server Environment:</div>
                <div className="ml-4 text-gray-700 mb-3">Direct database operations with revalidation</div>
                
                <div className="text-green-800 mb-2">🌐 Client Environment:</div>
                <div className="ml-4 text-gray-700">API calls with optimistic updates</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Hybrid Rendering Strategy</h3>
              <p className="text-gray-600 mb-3">
                Pages use the optimal rendering strategy for their use case:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Home & Posts:</strong> Server Components for SEO and performance</li>
                <li><strong>Dashboard:</strong> Hybrid with server data + client interactivity</li>
                <li><strong>Forms:</strong> Client Components with Server Actions</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">🔄 Universal API</h3>
                <p className="text-sm text-gray-600">
                  Same <code className="bg-gray-100 px-2 py-1 rounded">useStorken</code>, 
                  <code className="bg-gray-100 px-2 py-1 rounded ml-1">get</code>, and 
                  <code className="bg-gray-100 px-2 py-1 rounded ml-1">set</code> functions 
                  work everywhere.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">⚡ Server Actions</h3>
                <p className="text-sm text-gray-600">
                  Form submissions and mutations use Next.js Server Actions 
                  integrated with Storken setters.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">🎯 TypeScript</h3>
                <p className="text-sm text-gray-600">
                  Full type safety across server-client boundaries with 
                  shared type definitions.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">📡 Data Fetching</h3>
                <p className="text-sm text-gray-600">
                  Server Components fetch data directly from the database, 
                  Client Components use API endpoints.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">🔄 Revalidation</h3>
                <p className="text-sm text-gray-600">
                  Automatic cache invalidation and page revalidation 
                  after mutations.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">🚀 Performance</h3>
                <p className="text-sm text-gray-600">
                  Zero client-side JavaScript for static content, 
                  optimistic updates for interactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-semibold mb-4">File Structure</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm font-mono">
            <div className="text-blue-300">src/</div>
            <div className="ml-2">
              <div className="text-green-300">app/</div>
              <div className="ml-4 text-gray-300">
                <div>layout.tsx          # Root layout</div>
                <div>page.tsx            # Home page (Server)</div>
                <div>posts/page.tsx      # Posts list (Server)</div>
                <div>posts/[id]/page.tsx # Post detail (Server)</div>
                <div>dashboard/page.tsx  # Dashboard (Hybrid)</div>
              </div>
              
              <div className="text-yellow-300 mt-2">components/</div>
              <div className="ml-4 text-gray-300">
                <div>PostList.tsx        # Server Component</div>
                <div>CreatePostForm.tsx  # Client Component</div>
                <div>ClientDashboard.tsx # Client Component</div>
              </div>
              
              <div className="text-purple-300 mt-2">store/</div>
              <div className="ml-4 text-gray-300">
                <div>server-store.ts     # Server implementation</div>
                <div>client-store.ts     # Client implementation</div>
                <div>index.ts            # Universal exports</div>
              </div>
              
              <div className="text-orange-300 mt-2">lib/</div>
              <div className="ml-4 text-gray-300">
                <div>actions.ts          # Server Actions</div>
                <div>db.ts               # Database utilities</div>
                <div>types.ts            # Shared types</div>
              </div>
            </div>
          </div>
        </section>

        <section className="card bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">Getting Started</h2>
          <p className="text-blue-800 mb-4">
            To run this example locally:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Navigate to the <code className="bg-blue-100 px-2 py-1 rounded">examples/nextjs-app-router</code> directory</li>
            <li>Install dependencies: <code className="bg-blue-100 px-2 py-1 rounded">npm install</code></li>
            <li>Start the development server: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></li>
            <li>Open <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3005</code> in your browser</li>
          </ol>
          
          <div className="mt-6 flex space-x-4">
            <Link href="/posts" className="btn btn-primary">
              Explore Posts
            </Link>
            <Link href="/dashboard" className="btn btn-secondary">
              View Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}