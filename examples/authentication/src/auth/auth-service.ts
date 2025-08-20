import type { User, LoginCredentials, RegisterData } from './auth-types'

// Mock JWT token verification
const mockVerifyToken = async (token: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  
  // Simple token decode simulation (in real app, use proper JWT library)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (Date.now() / 1000 > payload.exp) {
      throw new Error('Token expired')
    }
    return payload.user
  } catch {
    throw new Error('Invalid token')
  }
}

// Mock login API call
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800)) // Simulate network delay
  
  // Mock authentication logic
  if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
    const user: User = {
      id: '1',
      name: 'Demo User',
      email: credentials.email,
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
    }
    
    // Create mock JWT token
    const payload = {
      user,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    }
    const token = `header.${btoa(JSON.stringify(payload))}.signature`
    
    return { user, token }
  }
  
  throw new Error('Invalid credentials')
}

// Mock registration API call
const mockRegister = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
  
  if (data.email === 'taken@example.com') {
    throw new Error('Email already taken')
  }
  
  const user: User = {
    id: Date.now().toString(),
    name: data.name,
    email: data.email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff`
  }
  
  // Create mock JWT token
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  }
  const token = `header.${btoa(JSON.stringify(payload))}.signature`
  
  return { user, token }
}

// Mock profile update API call  
const mockUpdateProfile = async (userData: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600)) // Simulate network delay
  
  const currentUserStr = localStorage.getItem('auth_user')
  if (!currentUserStr) {
    throw new Error('No user found')
  }
  
  try {
    const currentUser = JSON.parse(currentUserStr)
    const updatedUser = { ...currentUser, ...userData }
    
    // Update localStorage with new user data
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    
    return updatedUser
  } catch (error) {
    throw new Error('Failed to update profile')
  }
}

export const authService = {
  login: mockLogin,
  register: mockRegister,
  verifyToken: mockVerifyToken,
  updateProfile: mockUpdateProfile
}