# 🧪 Testing Guide

A comprehensive guide to running unit, integration, and performance tests for this project.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Performance Tests](#performance-tests)
- [Test Coverage](#test-coverage)

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run all tests (unit + integration)
npm test
```

---

## 🚀 Running Tests

| Command | Description |
|--------|-------------|
| `npm test` | Run everything — unit + integration tests |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:coverage` | Run all tests with a coverage report |
| `npm run test:performance` | Run performance/load tests (requires running server) |

> **Windows users:** You can also run `cmd /c "npm test 2>&1"` to capture all output in a single terminal.

---

## 🔬 Unit Tests

Unit tests validate individual functions and modules in isolation — no database, no server, no external dependencies.

### Running Unit Tests

```bash
npm run test:unit
```

---

## 🔗 Integration Tests

Integration tests validate the full request-response lifecycle across all major API endpoints. They use **`mongodb-memory-server`** — a real in-memory MongoDB instance that spins up automatically for each test suite. No external database connection is required.

### Design Principles

- **Full isolation** — the database is cleared after every individual test case
- **No mocking** — tests hit real route handlers, middleware, and database operations
- **Self-contained** — zero external dependencies; runs anywhere `npm test` runs

### Running Integration Tests

```bash
npm run test:integration
```

### What the Integration Tests Cover

#### `auth.test.js` — `/api/auth/*`

| Scenario | Details |
|----------|---------|
| Signup (refugee) | Creates a refugee user account |
| Signup (contributor) | Creates a contributor user account |
| Login success | Returns JWT token on valid credentials |
| Login failures | Returns 401 on wrong password or unknown email |
| Logout + token blacklisting | Invalidates JWT after logout |

#### `categories.test.js` — `/api/categories/*`

| Scenario | Details |
|----------|---------|
| Public get/list | Returns categories without authentication |
| Admin-only create | Returns 403 for non-admin users |
| Admin-only update | Returns 403 for non-admin users |
| Admin-only delete | Returns 403 for non-admin users |
| Auth enforcement | Returns 401 when no token is provided |

#### `lessons.test.js` — `/api/lessons/*`

| Scenario | Details |
|----------|---------|
| Create lesson | Creates a lesson linked to a course |
| Read / list | Fetch a single lesson or filter by `courseId` |
| Update lesson | Modifies lesson content and metadata |
| Delete lesson | Removes a lesson by ID |
| Publish | Validates that all required sections are present before publishing |
| Unpublish | Reverts a published lesson back to draft |

---

## 📊 Performance Tests

Performance (load) tests use **Artillery** to simulate real traffic against a live running server and measure throughput, latency, and error rates.

> ⚠️ These tests require a **running server** — they cannot run against an in-memory instance.

### Setup — Two Terminals Required

**Terminal 1 — Start the server:**

```bash
npm run dev
```

Make sure the server is running on `http://localhost:5000`. If your server uses a different port, update the `target` field in `tests/performance/load-test.yml` accordingly.

**Terminal 2 — Run the load test:**

```bash
npm run test:performance
```

### What Artillery Reports

After the test completes, Artillery prints a detailed summary including:

- **RPS** — Requests per second
- **Latency percentiles** — p50, p95, p99 response times
- **Error rates** — HTTP 4xx/5xx counts and percentages
- **Scenario counts** — how many virtual users completed each flow

---

## 📈 Test Coverage

Generate a full HTML + terminal coverage report:

```bash
npm run test:coverage
```

Coverage output is written to the `coverage/` directory. Open `coverage/lcov-report/index.html` in your browser for a detailed line-by-line breakdown.

---

## 🗂️ Project Test Structure

```
tests/
├── unit/                   # Unit tests (no DB, no server)
├── integration/            # Integration tests (in-memory MongoDB)
│   ├── auth.test.js
│   ├── categories.test.js
│   └── lessons.test.js
└── performance/            # Artillery load tests
    └── load-test.yml
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Jest](https://jestjs.io/) | Test runner for unit and integration tests |
| [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) | In-memory MongoDB for integration tests |
| [Artillery](https://www.artillery.io/) | Load and performance testing |
| [supertest](https://github.com/ladjs/supertest) | HTTP assertion library for integration tests |