import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ButtonExample } from './ButtonExample';

describe('ButtonExample', () => {
  it('renders the provided label', () => {
    render(<ButtonExample text="Press" onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Press' })).toBeInTheDocument();
  });

  it('calls the handler on click', () => {
    const onClick = vi.fn();
    render(<ButtonExample text="Submit" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
