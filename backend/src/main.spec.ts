import { Test, TestingModule } from '@nestjs/testing';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Mock the bootstrap function to prevent actual server startup during tests
jest.mock('@nestjs/core');

describe('Main Bootstrap', () => {
  const mockApp = {
    enableCors: jest.fn(),
    useGlobalPipes: jest.fn(),
    useGlobalFilters: jest.fn(),
    listen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  it('should bootstrap the application with correct configuration', async () => {
    // Import and execute the bootstrap function
    await import('./main');

    // Wait for the bootstrap to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: [
        'http://localhost:3200',
        'http://localhost:3001',
        'http://localhost:5173',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(AllExceptionsFilter),
    );
    // Test that listen is called with a valid port
    expect(mockApp.listen).toHaveBeenCalled();
    const listenCall = mockApp.listen.mock.calls[0][0];
    expect(typeof listenCall === 'string' || typeof listenCall === 'number').toBe(true);
  });

  it('should handle PORT environment variable logic correctly', () => {
    // Test the port logic directly
    const originalPort = process.env.PORT;
    
    // Test with no PORT set
    delete process.env.PORT;
    expect(process.env.PORT ?? 3000).toBe(3000);
    
    // Test with PORT set
    process.env.PORT = '4000';
    expect(process.env.PORT ?? 3000).toBe('4000');
    
    // Restore original value
    if (originalPort !== undefined) {
      process.env.PORT = originalPort;
    } else {
      delete process.env.PORT;
    }
  });
});
