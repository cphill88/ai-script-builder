import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from './Editor';

describe('Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default preview mode', () => {
    render(<Editor />);
    
    expect(screen.getByText('Script Editor')).toBeInTheDocument();
    expect(screen.getByText('Mode: Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should render sample script content in preview mode', () => {
    render(<Editor />);
    
    expect(screen.getByText(/ExampleCo Home Solutions/)).toBeInTheDocument();
    expect(screen.getByText(/Sample Call Script/)).toBeInTheDocument();
  });

  it('should toggle between edit and preview modes', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    const toggleButton = screen.getByRole('button', { name: 'Edit' });
    
    // Switch to edit mode
    await user.click(toggleButton);
    expect(screen.getByText('Mode: Edit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown editor')).toBeInTheDocument();
    
    // Switch back to preview mode
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByText('Mode: Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('should show textarea with content in edit mode', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    const textarea = screen.getByLabelText('Markdown editor') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('# ExampleCo Home Solutions');
    expect(textarea.value).toContain('<% function abc12345-def6-7890-ghij-klmnopqrstuv %>');
  });

  it('should update content when typing in edit mode', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    const textarea = screen.getByLabelText('Markdown editor') as HTMLTextAreaElement;
    const newContent = '\n\nNew content added';
    
    await user.type(textarea, newContent);
    expect(textarea.value).toContain(newContent);
  });

  it('should show slash command menu when typing /', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    const textarea = screen.getByLabelText('Markdown editor');
    await user.click(textarea);
    await user.type(textarea, '/');
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  it('should preserve content when switching between modes', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    // Switch to edit mode
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    const textarea = screen.getByLabelText('Markdown editor') as HTMLTextAreaElement;
    
    // Add some content
    await user.type(textarea, '\n\nTest content');
    const modifiedContent = textarea.value;
    
    // Switch to preview mode
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    
    // Switch back to edit mode
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    const textareaAfter = screen.getByLabelText('Markdown editor') as HTMLTextAreaElement;
    expect(textareaAfter.value).toBe(modifiedContent);
  });

  it('should close slash menu when switching modes', async () => {
    const user = userEvent.setup();
    render(<Editor />);
    
    // Switch to edit mode and trigger slash menu
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const textarea = screen.getByLabelText('Markdown editor');
    await user.type(textarea, '/');
    
    // Verify menu is shown
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Switch to preview mode
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    
    // Menu should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should handle function placeholder updates in preview mode', async () => {
    render(<Editor />);
    
    // In preview mode, function badges should be rendered
    const badges = await screen.findAllByRole('button', { name: /function/i });
    expect(badges.length).toBeGreaterThan(0);
  });
});