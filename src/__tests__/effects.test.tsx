import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { Snowfall } from '../features/advent/components/Snowfall'
import { NorthernLights } from '../features/advent/components/NorthernLights'
import { ButterflyCollection } from '../features/advent/components/ButterflyCollection'
import { FloatingFireflies } from '../features/advent/components/FloatingFireflies'

describe('Visual Effects', () => {
  it('renders Snowfall', () => {
    render(<Snowfall />)
    // Assuming Snowfall has some identifiable element
    expect(document.querySelector('.snowflake')).toBeInTheDocument()
  })

  it('renders NorthernLights', () => {
    render(<NorthernLights />)
    expect(document.querySelector('.northern-lights')).toBeInTheDocument()
  })

  it('renders ButterflyCollection', () => {
    render(<ButterflyCollection onButterflyCaught={() => {}} />)
    expect(document.querySelector('.butterfly')).toBeInTheDocument()
  })

  it('renders FloatingFireflies', () => {
    render(<FloatingFireflies />)
    expect(document.querySelector('.firefly')).toBeInTheDocument()
  })
})