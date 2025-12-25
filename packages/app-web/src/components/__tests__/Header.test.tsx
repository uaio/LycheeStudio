/**
 * Header component tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';

const mockAdapter = {
  fileSystem: {
    readFile: vi.fn().mockResolvedValue(''),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(true),
  },
  command: {
    exec: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
  },
  environment: {
    getUserHomeDir: '/home/user',
  },
};

function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

describe('Header Component', () => {
  it('should render header', () => {
    renderWithRouter(<Header adapter={null as any} />);
    expect(screen.getByText('AI Tools Manager')).toBeVisible();
  });

  it('should render navigation links', () => {
    renderWithRouter(<Header adapter={null as any} />);

    expect(screen.getByText('首页')).toBeVisible();
    expect(screen.getByText('MCP 管理')).toBeVisible();
    expect(screen.getByText('Claude 模型')).toBeVisible();
    expect(screen.getByText('Claude Prompts')).toBeVisible();
  });

  it('should navigate to MCP manager on click', async () => {
    const { container } = renderWithRouter(<Header adapter={null as any} />);

    const link = container.querySelector('a[href*="/mcp-manager"]');
    expect(link).toBeInTheDocument();
  });
});
