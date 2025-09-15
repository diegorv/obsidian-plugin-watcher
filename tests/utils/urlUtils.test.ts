import { parseUrl, formatUrlForDisplay, formatNetworkContext, ParsedUrl } from '../../src/utils/urlUtils';

describe('urlUtils', () => {
  describe('parseUrl', () => {
    it('should parse valid HTTP URL', () => {
      const result = parseUrl('http://example.com/path?query=value');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/path',
        search: '?query=value',
        fullPath: 'example.com/path?query=value',
      });
    });

    it('should parse valid HTTPS URL', () => {
      const result = parseUrl('https://api.github.com/users/test');
      
      expect(result).toEqual({
        domain: 'api.github.com',
        pathname: '/users/test',
        search: '',
        fullPath: 'api.github.com/users/test',
      });
    });

    it('should parse URL with port', () => {
      const result = parseUrl('http://localhost:3000/api/data');
      
      expect(result).toEqual({
        domain: 'localhost',
        pathname: '/api/data',
        search: '',
        fullPath: 'localhost/api/data',
      });
    });

    it('should parse URL with complex path', () => {
      const result = parseUrl('https://example.com/api/v1/users/123/profile?include=posts&limit=10');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/api/v1/users/123/profile',
        search: '?include=posts&limit=10',
        fullPath: 'example.com/api/v1/users/123/profile?include=posts&limit=10',
      });
    });

    it('should parse URL with hash fragment', () => {
      const result = parseUrl('https://example.com/page#section');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/page',
        search: '',
        fullPath: 'example.com/page',
      });
    });

    it('should return null for invalid URL', () => {
      const result = parseUrl('not-a-url');
      
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseUrl('');
      
      expect(result).toBeNull();
    });

    it('should return null for malformed URL', () => {
      const result = parseUrl('http://');
      
      expect(result).toBeNull();
    });
  });

  describe('formatUrlForDisplay', () => {
    it('should format valid URL for display', () => {
      const result = formatUrlForDisplay('https://api.example.com/data?param=value');
      
      expect(result).toBe('api.example.com/data?param=value');
    });

    it('should return original string for invalid URL', () => {
      const result = formatUrlForDisplay('not-a-url');
      
      expect(result).toBe('not-a-url');
    });

    it('should handle empty string', () => {
      const result = formatUrlForDisplay('');
      
      expect(result).toBe('');
    });
  });

  describe('formatNetworkContext', () => {
    it('should format valid URL with network emoji', () => {
      const result = formatNetworkContext('https://api.example.com/users');
      
      expect(result).toBe('🌐 api.example.com/users');
    });

    it('should format URL with query parameters', () => {
      const result = formatNetworkContext('https://example.com/search?q=test&page=1');
      
      expect(result).toBe('🌐 example.com/search?q=test&page=1');
    });

    it('should handle invalid URL with emoji', () => {
      const result = formatNetworkContext('invalid-url');
      
      expect(result).toBe('🌐 invalid-url');
    });

    it('should handle empty string', () => {
      const result = formatNetworkContext('');
      
      expect(result).toBe('🌐 ');
    });
  });

  describe('ParsedUrl interface', () => {
    it('should have correct structure', () => {
      const parsedUrl: ParsedUrl = {
        domain: 'example.com',
        pathname: '/path',
        search: '?query=value',
        fullPath: 'example.com/path?query=value',
      };
      
      expect(parsedUrl.domain).toBe('example.com');
      expect(parsedUrl.pathname).toBe('/path');
      expect(parsedUrl.search).toBe('?query=value');
      expect(parsedUrl.fullPath).toBe('example.com/path?query=value');
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with special characters', () => {
      const result = parseUrl('https://example.com/path%20with%20spaces?param=value%20with%20spaces');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/path%20with%20spaces',
        search: '?param=value%20with%20spaces',
        fullPath: 'example.com/path%20with%20spaces?param=value%20with%20spaces',
      });
    });

    it('should handle URLs with multiple query parameters', () => {
      const result = parseUrl('https://example.com/api?param1=value1&param2=value2&param3=value3');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/api',
        search: '?param1=value1&param2=value2&param3=value3',
        fullPath: 'example.com/api?param1=value1&param2=value2&param3=value3',
      });
    });

    it('should handle root path', () => {
      const result = parseUrl('https://example.com/');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/',
        search: '',
        fullPath: 'example.com/',
      });
    });

    it('should handle URL without path', () => {
      const result = parseUrl('https://example.com');
      
      expect(result).toEqual({
        domain: 'example.com',
        pathname: '/',
        search: '',
        fullPath: 'example.com/',
      });
    });
  });
});
