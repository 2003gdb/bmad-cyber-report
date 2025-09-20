import { render, screen } from '@testing-library/react'
import MetricsCard from '../../components/Dashboard/MetricsCard'

describe('MetricsCard', () => {
  const mockIcon = (
    <svg data-testid="test-icon" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )

  it('should render with basic props', () => {
    render(
      <MetricsCard
        title="Total Reports"
        value={100}
        icon={mockIcon}
      />
    )

    expect(screen.getByText('Total Reports')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(
      <MetricsCard
        title="Status"
        value="Active"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should apply default blue color', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={50}
        icon={mockIcon}
      />
    )

    const card = screen.getByText('Test Metric').closest('.bg-blue-50')
    expect(card).toHaveClass('bg-blue-50', 'text-blue-700', 'border-blue-200')
  })

  it('should apply green color when specified', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={50}
        icon={mockIcon}
        color="green"
      />
    )

    const card = screen.getByText('Test Metric').closest('.bg-green-50')
    expect(card).toHaveClass('bg-green-50', 'text-green-700', 'border-green-200')
  })

  it('should apply yellow color when specified', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={50}
        icon={mockIcon}
        color="yellow"
      />
    )

    const card = screen.getByText('Test Metric').closest('.bg-yellow-50')
    expect(card).toHaveClass('bg-yellow-50', 'text-yellow-700', 'border-yellow-200')
  })

  it('should apply red color when specified', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={50}
        icon={mockIcon}
        color="red"
      />
    )

    const card = screen.getByText('Test Metric').closest('.bg-red-50')
    expect(card).toHaveClass('bg-red-50', 'text-red-700', 'border-red-200')
  })

  it('should have correct icon color classes', () => {
    render(
      <MetricsCard
        title="Test Metric"
        value={50}
        icon={mockIcon}
        color="red"
      />
    )

    const iconContainer = screen.getByTestId('test-icon').parentElement
    expect(iconContainer).toHaveClass('text-red-600')
  })

  it('should have proper structure and accessibility', () => {
    render(
      <MetricsCard
        title="Accessibility Test"
        value={75}
        icon={mockIcon}
      />
    )

    // Check for proper semantic structure
    const title = screen.getByText('Accessibility Test')
    const value = screen.getByText('75')

    expect(title.tagName).toBe('DT')
    expect(value.tagName).toBe('DD')

    // Check for proper ARIA structure
    const definitionList = title.closest('dl')
    expect(definitionList).toBeInTheDocument()
  })

  it('should handle large numbers', () => {
    render(
      <MetricsCard
        title="Large Number"
        value={1000000}
        icon={mockIcon}
      />
    )

    expect(screen.getByText('1000000')).toBeInTheDocument()
  })

  it('should handle zero values', () => {
    render(
      <MetricsCard
        title="Zero Value"
        value={0}
        icon={mockIcon}
      />
    )

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('should truncate long titles', () => {
    const longTitle = "This is a very long title that should be truncated according to the CSS classes"

    render(
      <MetricsCard
        title={longTitle}
        value={42}
        icon={mockIcon}
      />
    )

    const titleElement = screen.getByText(longTitle)
    expect(titleElement).toHaveClass('truncate')
  })
})