import { StorkenProvider } from 'storken/next'
import { store } from './store'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StorkenProvider store={store}>
          {children}
        </StorkenProvider>
      </body>
    </html>
  )
}