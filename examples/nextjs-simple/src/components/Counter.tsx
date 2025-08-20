'use client'

import { useCounter } from '../store/store'

export default function Counter() {
  const [count, setCount] = useCounter('count', 0)

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Storken Counter</h2>
      <div className="text-center">
        <p className="text-4xl font-bold text-blue-600 mb-4">{count}</p>
        <div className="space-x-4">
          <button
            onClick={() => setCount((prev: number) => prev + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment
          </button>
          <button
            onClick={() => setCount((prev: number) => prev - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Decrement
          </button>
          <button
            onClick={() => setCount(0)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}