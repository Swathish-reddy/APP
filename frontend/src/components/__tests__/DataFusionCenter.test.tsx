import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataFusionCenter from '../dashboard/DataFusionCenter';
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

describe('DataFusionCenter', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.setItem('token', 'fake-token')
  })

  it('renders loading state initially or fetching data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ has_data: false, panels: [] })
    })

    render(<DataFusionCenter patientId="P101" />)
    
    // Check title
    expect(screen.getByText('Multi-Modal Data Fusion Center')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/twin/patient/101/fusion',
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' }
        })
      )
    })
  })

  it('displays insights when data is available', async () => {
    const mockData = {
      has_data: true,
      panels: [
        { id: 'cbc', label: 'CBC', color: 'text-red-500', data: { WBC: '5.5' } }
      ],
      insights: [
        { type: 'warning', title: 'Test Warning', description: 'Test Description' }
      ],
      action_plan: ['Test Action']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    render(<DataFusionCenter patientId="P102" />)

    await waitFor(() => {
      expect(screen.getByText('Test Warning')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Action')).toBeInTheDocument()
    })
  })

  it('handles force resync button click', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ has_data: false, panels: [] })
    })

    render(<DataFusionCenter patientId="P101" />)

    const btn = await screen.findByText('Force Resync')
    fireEvent.click(btn)

    await waitFor(() => {
      // Should be called twice: once on mount, once on click
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
