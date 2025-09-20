import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import App from './App';

// Mock framer-motion to avoid IntersectionObserver issues in tests
interface MockMotionProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MockMotionProps) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: MockMotionProps) => <header {...props}>{children}</header>,
    h1: ({ children, ...props }: MockMotionProps) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: MockMotionProps) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: MockMotionProps) => <section {...props}>{children}</section>,
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

test('renders app without crashing', () => {
  const { container } = renderWithRouter(<App />);
  expect(container).toBeTruthy();
});

test('renders home page content', async () => {
  renderWithRouter(<App />);
  
  // Wait for the home page to load with more specific content
  await waitFor(
    () => {
      expect(screen.getByText(/Welcome to/i)).toBeTruthy();
    },
    { timeout: 3000 }
  );
  
  // Check for main hero content
  expect(screen.getByText(/AI-Powered Presentations/i)).toBeTruthy();
  expect(screen.getByText(/Empower your business with AI-generated/i)).toBeTruthy();
});

test('renders CTA buttons with proper links', async () => {
  renderWithRouter(<App />);
  
  // Wait for content to load
  await waitFor(
    () => {
      expect(screen.getByText(/Welcome to/i)).toBeTruthy();
    },
    { timeout: 3000 }
  );
  
  // Find buttons by text and check their attributes
  const getStartedButtons = screen.getAllByText('Get Started');
  const loginButton = screen.getByText('Login');
  
  // Should have at least one Get Started button
  expect(getStartedButtons.length).toBeGreaterThanOrEqual(1);
  
  // Check that all Get Started buttons link to signup
  getStartedButtons.forEach(button => {
    expect(button.closest('a')).toHaveAttribute('href', '/signup');
  });
  
  expect(loginButton).toBeTruthy();
  expect(loginButton.closest('a')).toHaveAttribute('href', '/login');
});
