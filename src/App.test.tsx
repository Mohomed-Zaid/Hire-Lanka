import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders HireLanka brand', () => {
  render(<App />);
  expect(screen.getByText(/HireLanka/i)).toBeInTheDocument();
});
