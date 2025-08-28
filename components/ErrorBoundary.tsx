"use client"
import React from "react"

export class Boundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    /* could log to Sentry later */
  }

  render() {
    return this.state.hasError ? null : this.props.children
  }
}
