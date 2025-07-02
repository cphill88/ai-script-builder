import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlashCommandMenu } from './SlashCommandMenu';
import * as dataModule from '@/data';

vi.mock('@/data', () => ({
  getAllFunctions: vi.fn(),
}));

describe('SlashCommandMenu', () => {
  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();
  const defaultPosition = { top: 50, left: 20 };
  
  const mockFunctions = [
    {
      id: 'func-1',
      displayName: 'Function One',
      description: 'Description for function one',
    },
    {
      id: 'func-2',
      displayName: 'Function Two',
      description: 'Description for function two',
    },
    {
      id: 'func-3',
      displayName: 'Function Three',
      description: 'Description for function three',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataModule.getAllFunctions).mockReturnValue(mockFunctions);
  });

  it('should render the menu with all functions', () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Function One')).toBeInTheDocument();
    expect(screen.getByText('Function Two')).toBeInTheDocument();
    expect(screen.getByText('Function Three')).toBeInTheDocument();
  });

  it('should display function descriptions', () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    expect(screen.getByText('Description for function one')).toBeInTheDocument();
    expect(screen.getByText('Description for function two')).toBeInTheDocument();
    expect(screen.getByText('Description for function three')).toBeInTheDocument();
  });

  it('should select a function on click', async () => {
    const user = userEvent.setup();
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    await user.click(screen.getByText('Function Two'));
    
    expect(mockOnSelect).toHaveBeenCalledWith('func-2');
  });

  it('should navigate with arrow keys', async () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    const secondOption = screen.getByRole('option', { name: /Function Two/i });
    expect(secondOption).toHaveAttribute('aria-selected', 'true');
    expect(secondOption).toHaveClass('bg-blue-100', 'text-blue-900');
    
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    
    const firstOption = screen.getByRole('option', { name: /Function One/i });
    expect(firstOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should wrap around when navigating past boundaries', () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    // Navigate to last item then press down
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowDown' }); // Should wrap to first
    
    const firstOption = screen.getByRole('option', { name: /Function One/i });
    expect(firstOption).toHaveAttribute('aria-selected', 'true');
    
    // Navigate up from first item (should wrap to last)
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    
    const lastOption = screen.getByRole('option', { name: /Function Three/i });
    expect(lastOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should select current item with Enter key', () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    // Navigate to second item
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    
    // Press Enter
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockOnSelect).toHaveBeenCalledWith('func-2');
  });

  it('should close menu with Escape key', () => {
    render(
      <SlashCommandMenu
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={defaultPosition}
      />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside element</div>
        <SlashCommandMenu
          onSelect={mockOnSelect}
          onClose={mockOnClose}
          position={defaultPosition}
        />
      </div>
    );
    
    await user.click(screen.getByTestId('outside'));
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});