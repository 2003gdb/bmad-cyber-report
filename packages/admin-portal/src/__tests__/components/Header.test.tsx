import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Header', () => {
  const mockLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        lastLogin: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: mockLogout,
      clearError: jest.fn(),
    })
  })

  it('should render header with user name', () => {
    render(<Header />)

    expect(screen.getByText('SafeTrade Admin Portal')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    render(<Header />)

    expect(screen.getAllByText('Panel de Control')).toHaveLength(2) // Desktop and mobile
    expect(screen.getAllByText('Reportes')).toHaveLength(2) // Desktop and mobile
  })

  it('should show email when name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        name: '',
        role: 'admin',
        lastLogin: '2023-01-01T00:00:00Z',
        createdAt: '2023-01-01T00:00:00Z',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: mockLogout,
      clearError: jest.fn(),
    })

    render(<Header />)

    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const logoutButton = screen.getByText('Cerrar Sesión')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('should render mobile navigation', () => {
    render(<Header />)

    // Mobile navigation should be present but hidden by default
    const mobileNavLinks = screen.getAllByText('Panel de Control')
    expect(mobileNavLinks).toHaveLength(2) // One for desktop, one for mobile

    const mobileReportsLinks = screen.getAllByText('Reportes')
    expect(mobileReportsLinks).toHaveLength(2) // One for desktop, one for mobile
  })

  it('should have correct navigation links', () => {
    render(<Header />)

    const dashboardLinks = screen.getAllByRole('link', { name: /panel de control/i })
    dashboardLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    const reportsLinks = screen.getAllByRole('link', { name: /reportes/i })
    reportsLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/reports')
    })
  })

  it('should render SafeTrade logo icon', () => {
    render(<Header />)

    // Check for the presence of the shield icon (logo) by finding the SVG
    const logoSvg = document.querySelector('svg')
    expect(logoSvg).toBeInTheDocument()
  })
})