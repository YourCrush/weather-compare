import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingButton } from '../LoadingButton';

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingButton isLoading={false}>
        Click me
      </LoadingButton>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('shows custom loading text when provided', () => {
    render(
      <LoadingButton isLoading={true} loadingText="Saving...">
        Save
      </LoadingButton>
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <LoadingButton isLoading={false} disabled={true}>
        Click me
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when not loading and not disabled', () => {
    const onClick = vi.fn();

    render(
      <LoadingButton isLoading={false} onClick={onClick}>
        Click me
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when loading', () => {
    const onClick = vi.fn();

    render(
      <LoadingButton isLoading={true} onClick={onClick}>
        Click me
      </LoadingButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies primary variant classes by default', () => {
    render(
      <LoadingButton isLoading={false}>
        Click me
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('applies secondary variant classes when specified', () => {
    render(
      <LoadingButton isLoading={false} variant="secondary">
        Click me
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-600');
  });

  it('applies danger variant classes when specified', () => {
    render(
      <LoadingButton isLoading={false} variant="danger">
        Delete
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies small size classes when specified', () => {
    render(
      <LoadingButton isLoading={false} size="sm">
        Small button
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('applies large size classes when specified', () => {
    render(
      <LoadingButton isLoading={false} size="lg">
        Large button
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('applies custom className', () => {
    render(
      <LoadingButton isLoading={false} className="custom-class">
        Click me
      </LoadingButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('shows loading spinner when loading', () => {
    render(
      <LoadingButton isLoading={true}>
        Click me
      </LoadingButton>
    );

    // Check for spinner by looking for the loading role
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('forwards other props to button element', () => {
    render(
      <LoadingButton 
        isLoading={false} 
        type="submit" 
        data-testid="test-button"
        aria-label="Test button"
      >
        Submit
      </LoadingButton>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });
});