#!/usr/bin/env node

/**
 * Security Test Suite for Advent Calendar Application
 *
 * This script tests all implemented security measures:
 * - RLS policies
 * - Input validation
 * - Authentication
 * - Rate limiting
 * - CSP headers
 */

import https from 'https';
import http from 'http';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:5173';

class SecurityTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
  }

  assert(condition, message) {
    if (condition) {
      this.passed++;
      this.log(`✓ ${message}`, 'PASS');
    } else {
      this.failed++;
      this.log(`✗ ${message}`, 'FAIL');
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testAPIHeaders() {
    this.log('Testing API security headers...');

    try {
      const response = await this.makeRequest(`${API_BASE}/health`);

      // Check security headers
      this.assert(
        response.headers['x-content-type-options'] === 'nosniff',
        'X-Content-Type-Options header should be nosniff'
      );

      this.assert(
        response.headers['x-frame-options'] === 'SAMEORIGIN',
        'X-Frame-Options header should be SAMEORIGIN'
      );

      this.assert(
        response.headers['x-xss-protection'] === '0',
        'X-XSS-Protection header should be disabled (CSP takes precedence)'
      );

      this.assert(
        response.headers['strict-transport-security'],
        'Strict-Transport-Security header should be present'
      );

      this.assert(
        response.headers['content-security-policy'],
        'Content-Security-Policy header should be present'
      );

    } catch (error) {
      this.log(`API headers test failed: ${error.message}`, 'ERROR');
      this.failed++;
    }
  }

  async testRateLimiting() {
    this.log('Testing rate limiting...');

    // Test rate limiting on API endpoints (health is excluded)
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(this.makeRequest(`${API_BASE}/api/calendars`));
    }

    try {
      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.filter(r =>
        r.status === 'fulfilled' && r.value.status === 429
      );

      this.assert(
        rateLimited.length > 0,
        'Rate limiting should trigger after multiple requests to API endpoints'
      );
    } catch (error) {
      this.log(`Rate limiting test failed: ${error.message}`, 'ERROR');
      this.failed++;
    }
  }

  async testInputValidation() {
    this.log('Testing input validation...');

    // Test invalid JSON
    try {
      const response = await this.makeRequest(`${API_BASE}/api/calendars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid'
        },
        body: '{invalid json'
      });

      this.assert(
        response.status === 400,
        'Invalid JSON should return 400 status'
      );
    } catch (error) {
      this.log(`Input validation test failed: ${error.message}`, 'ERROR');
      this.failed++;
    }
  }

  async testCSPHeaders() {
    this.log('Testing Content Security Policy...');

    try {
      const response = await this.makeRequest(FRONTEND_BASE);

      this.assert(
        response.headers['content-security-policy'],
        'Frontend should have CSP header'
      );

      const csp = response.headers['content-security-policy'];
      this.assert(
        csp.includes("default-src 'self'"),
        'CSP should restrict default sources to self'
      );

      this.assert(
        csp.includes("script-src 'self'"),
        'CSP should restrict script sources'
      );

    } catch (error) {
      this.log(`CSP test failed: ${error.message}`, 'ERROR');
      this.failed++;
    }
  }

  async testRLSPolicies() {
    this.log('Testing RLS policies (requires authentication)...');

    // Test that unauthenticated requests are rejected
    try {
      const response = await this.makeRequest(`${API_BASE}/api/calendars`);

      this.assert(
        response.status === 401,
        'Unauthenticated requests should be rejected with 401'
      );

      // Check that the error message indicates auth is required
      const data = JSON.parse(response.data);
      this.assert(
        data.error && data.error.includes('Authorization'),
        'Error should indicate authorization is required'
      );
    } catch (error) {
      this.log(`RLS test failed: ${error.message}`, 'ERROR');
      this.failed++;
    }
  }

  async runAllTests() {
    this.log('Starting Security Test Suite...');
    this.log('='.repeat(50));

    await this.testAPIHeaders();
    await this.testRateLimiting();
    await this.testInputValidation();
    await this.testCSPHeaders();
    await this.testRLSPolicies();

    this.log('='.repeat(50));
    this.log(`Test Results: ${this.passed} passed, ${this.failed} failed`);

    if (this.failed === 0) {
      this.log('🎉 All security tests passed!', 'SUCCESS');
      process.exit(0);
    } else {
      this.log('❌ Some security tests failed!', 'ERROR');
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default SecurityTester;