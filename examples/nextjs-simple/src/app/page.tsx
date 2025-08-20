import Counter from '../components/Counter'
import UserProfile from '../components/UserProfile'
import PostsList from '../components/PostsList'

export default function Home() {
  return (
    <div className="px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Storken + Next.js App Router
        </h1>
        <p className="text-lg text-gray-600">
          Demonstrating Storken state management with Next.js 14+ App Router
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Counter />
        <UserProfile />
        <PostsList />
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Features Demonstrated</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Counter Component</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Basic state management with Storken</li>
              <li>• useState-like pattern</li>
              <li>• Functional updates</li>
              <li>• Client-side rendering</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">User Profile</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• localStorage persistence</li>
              <li>• Getter/setter patterns</li>
              <li>• Form handling</li>
              <li>• Conditional rendering</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Posts List</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Async data fetching</li>
              <li>• Loading states</li>
              <li>• Manual refresh</li>
              <li>• Mock API integration</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Architecture</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Next.js 14+ App Router</li>
              <li>• TypeScript integration</li>
              <li>• Tailwind CSS styling</li>
              <li>• Client components with 'use client'</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}