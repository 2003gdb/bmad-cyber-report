import { adminAPIService } from '../../services/AdminAPIService'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('AdminAPIService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const loginResponse = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(loginResponse),
      })

      const result = await adminAPIService.login({
        email: 'admin@test.com',
        password: 'password'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@test.com',
            password: 'password'
          }),
        })
      )

      expect(result).toEqual(loginResponse)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('admin_token', 'test-token')
    })

    it('should handle login error', async () => {
      const errorResponse = {
        message: 'Invalid credentials',
        statusCode: 401
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue(errorResponse),
      })

      await expect(adminAPIService.login({
        email: 'admin@test.com',
        password: 'wrong-password'
      })).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear token from localStorage', () => {
      adminAPIService.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin_token')
    })
  })

  describe('getDashboardMetrics', () => {
    it('should fetch dashboard metrics with authorization header', async () => {
      const metricsResponse = {
        totalReports: 100,
        reportsToday: 5,
        criticalReports: 3,
        recentTrends: []
      }

      // Mock existing token
      adminAPIService.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(metricsResponse),
      })

      const result = await adminAPIService.getDashboardMetrics()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/dashboard',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )

      expect(result).toEqual(metricsResponse)
    })
  })

  describe('getReports', () => {
    it('should fetch reports with query parameters', async () => {
      const reportsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }

      adminAPIService.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(reportsResponse),
      })

      const params = {
        page: 2,
        limit: 20,
        status: 'pendiente',
        attackType: 'phishing'
      }

      const result = await adminAPIService.getReports(params)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/reports?page=2&limit=20&status=pendiente&attack_type=phishing',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )

      expect(result).toEqual(reportsResponse)
    })

    it('should fetch reports without parameters', async () => {
      const reportsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }

      adminAPIService.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(reportsResponse),
      })

      const result = await adminAPIService.getReports()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/reports',
        expect.any(Object)
      )

      expect(result).toEqual(reportsResponse)
    })
  })

  describe('getReportById', () => {
    it('should fetch report by ID', async () => {
      const reportResponse = {
        id: 1,
        attackType: 'phishing',
        description: 'Test report',
        status: 'pendiente'
      }

      adminAPIService.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(reportResponse),
      })

      const result = await adminAPIService.getReportById(1)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/reports/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )

      expect(result).toEqual(reportResponse)
    })
  })

  describe('updateReportStatus', () => {
    it('should update report status', async () => {
      const updatedReport = {
        id: 1,
        status: 'resuelto',
        adminNotes: 'Resolved issue'
      }

      adminAPIService.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(updatedReport),
      })

      const updateData = {
        status: 'resuelto',
        adminNotes: 'Resolved issue'
      }

      const result = await adminAPIService.updateReportStatus(1, updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/reports/1/status',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify(updateData),
        })
      )

      expect(result).toEqual(updatedReport)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      adminAPIService.setToken('test-token')
      expect(adminAPIService.isAuthenticated()).toBe(true)
    })

    it('should return false when no token', () => {
      adminAPIService.logout()
      expect(adminAPIService.isAuthenticated()).toBe(false)
    })
  })

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      adminAPIService.setToken('valid-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ valid: true }),
      })

      const result = await adminAPIService.validateToken()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/admin/validate-token',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      )
    })

    it('should return false and logout for invalid token', async () => {
      adminAPIService.setToken('invalid-token')

      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))

      const result = await adminAPIService.validateToken()

      expect(result).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('admin_token')
    })
  })

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminAPIService.getDashboardMetrics()).rejects.toThrow('Network error')
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      })

      await expect(adminAPIService.getDashboardMetrics()).rejects.toThrow('Error de conexión')
    })
  })
})