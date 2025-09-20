import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { adminAPIService } from '../../services/AdminAPIService'

// Mock the AdminAPIService
jest.mock('../../services/AdminAPIService', () => ({
  adminAPIService: {
    login: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
    validateToken: jest.fn(),
  },
}))

// Test component to use the AuthContext
function TestComponent() {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  )
}

const mockAdminAPIService = adminAPIService as jest.Mocked<typeof adminAPIService>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAdminAPIService.getToken.mockReturnValue(null)
  })

  it('should render with initial loading state', () => {
    mockAdminAPIService.validateToken.mockResolvedValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      token: 'test-token',
      admin: {
        id: 1,
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        lastLogin: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      }
    }

    mockAdminAPIService.login.mockResolvedValue(mockResponse)
    mockAdminAPIService.validateToken.mockResolvedValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Click login button
    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('admin@test.com')
    })
  })

  it('should handle login error', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'

    mockAdminAPIService.login.mockRejectedValue(new Error(errorMessage))
    mockAdminAPIService.validateToken.mockResolvedValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Click login button
    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })
  })

  it('should handle logout', async () => {
    const user = userEvent.setup()

    // Start with authenticated state
    mockAdminAPIService.getToken.mockReturnValue('existing-token')
    mockAdminAPIService.validateToken.mockResolvedValue(true)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for authentication check
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
    })

    // Click logout button
    await user.click(screen.getByText('Logout'))

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    expect(mockAdminAPIService.logout).toHaveBeenCalled()
  })

  it('should clear error', async () => {
    const user = userEvent.setup()

    mockAdminAPIService.login.mockRejectedValue(new Error('Test error'))
    mockAdminAPIService.validateToken.mockResolvedValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial loading
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })

    // Trigger error
    await user.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Test error')
    })

    // Clear error
    await user.click(screen.getByText('Clear Error'))

    expect(screen.getByTestId('error')).toHaveTextContent('No Error')
  })

  it('should validate existing token on mount', async () => {
    mockAdminAPIService.getToken.mockReturnValue('existing-token')
    mockAdminAPIService.validateToken.mockResolvedValue(true)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
      expect(mockAdminAPIService.validateToken).toHaveBeenCalled()
    })
  })

  it('should logout if token validation fails', async () => {
    mockAdminAPIService.getToken.mockReturnValue('invalid-token')
    mockAdminAPIService.validateToken.mockResolvedValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    })
  })
})