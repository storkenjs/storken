import { store, ServerData, prepare } from './store'
import ClientSection from './client-section'

export default async function HomePage() {
  // Server-side data fetching - super simple!
  const data = await prepare(['posts'])
  
  return (
    <main>
      <h1>Storken Universal Example</h1>
      
      {/* Auto-hydration */}
      <ServerData data={data} />
      
      {/* Server-rendered content */}
      <section>
        <h2>Posts (Server Rendered)</h2>
        <ul>
          {data.posts.map((post: any) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </section>
      
      {/* Client interactive section */}
      <ClientSection />
    </main>
  )
}