import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunctionBadge } from './FunctionBadge';
import * as dataModule from '@/data';

// Mock the data module
vi.mock('@/data', () => ({
  getFunctionById: vi.fn(),
  getAllFunctions: vi.fn(),
}));

describe('FunctionBadge', () => {
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();
  
  const mockFunction = {
    id: 'test-function-id',
    displayName: 'Test Function',
    description: 'This is a test function description',
  };
  
  const mockFunctions = [
    mockFunction,
    {
      id: 'another-function',
      displayName: 'Another Function',
      description: 'Another function description',
    },
    {
      id: 'third-function',
      displayName: 'Third Function',
      description: 'Third function description',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dataModule.getFunctionById).mockReturnValue(mockFunction);
    vi.mocked(dataModule.getAllFunctions).mockReturnValue(mockFunctions);
  });

  it('should render the function badge with display name', () => {
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test Function')).toBeInTheDocument();
  });

  it('should show tooltip with description on hover', async () => {
    const user = userEvent.setup();
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    const badge = screen.getByRole('button', { name: /Function: Test Function/i });
    await user.hover(badge);
    
    await waitFor(() => {
      const tooltips = screen.getAllByText('This is a test function description');
      expect(tooltips.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should open popover with function list on click', async () => {
    const user = userEvent.setup();
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    const badge = screen.getByRole('button', { name: /Function: Test Function/i });
    await user.click(badge);
    
    expect(screen.getByRole('option', { name: /Test Function/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Another Function/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Third Function/i })).toBeInTheDocument();
  });

  it('should call onUpdate when selecting a different function', async () => {
    const user = userEvent.setup();
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Function: Test Function/i }));
    await user.click(screen.getByRole('option', { name: /Another Function/i }));
    
    expect(mockOnUpdate).toHaveBeenCalledWith('another-function');
  });

  it('should close popover after selecting a function', async () => {
    const user = userEvent.setup();
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /Function: Test Function/i }));
    await user.click(screen.getByRole('option', { name: /Another Function/i }));
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clicking delete button', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete Test Function');
    await user.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this function?');
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should not delete when user cancels confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    
    render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete Test Function');
    await user.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should render unknown function badge when function is not found', () => {
    vi.mocked(dataModule.getFunctionById).mockReturnValue(undefined);
    
    render(
      <FunctionBadge
        functionId="non-existent-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Unknown function')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete unknown function')).toBeInTheDocument();
  });

  it('should delete unknown function without confirmation', async () => {
    vi.mocked(dataModule.getFunctionById).mockReturnValue(undefined);
    const user = userEvent.setup();
    
    render(
      <FunctionBadge
        functionId="non-existent-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete unknown function');
    await user.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('should memoize function data to avoid unnecessary lookups', () => {
    const { rerender } = render(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(dataModule.getFunctionById).toHaveBeenCalledTimes(1);
    expect(dataModule.getAllFunctions).toHaveBeenCalledTimes(1);
    
    rerender(
      <FunctionBadge
        functionId="test-function-id"
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(dataModule.getFunctionById).toHaveBeenCalledTimes(1);
    expect(dataModule.getAllFunctions).toHaveBeenCalledTimes(1);
  });
});