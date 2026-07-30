# Quiz Testing Documentation

This document describes the comprehensive test suite for the quiz functionality in the AF_Backend application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Performance Tests](#performance-tests)
- [Test Patterns](#test-patterns)

---

## Overview

The quiz test suite includes **comprehensive unit tests, integration tests, and performance tests** covering all quiz-related functionality including:

- Quiz CRUD operations
- Question management
- Option management
- Quiz attempt submission and scoring
- Third-party API integration (Datamuse API for distractor generation)

**Total Test Files**: 13 (5 service unit tests, 5 controller unit tests, 3 integration tests)

---

## Test Structure

```
tests/
├── unit/
│   ├── services/
│   │   └── quiz/
│   │       ├── quizService.test.js
│   │       ├── questionService.test.js
│   │       ├── optionService.test.js
│   │       ├── quizAttemptService.test.js
│   │       └── distractorService.test.js
│   └── controllers/
│       └── quiz/
│           ├── quizController.test.js
│           ├── questionController.test.js
│           ├── optionController.test.js
│           ├── quizAttemptController.test.js
│           └── distractorController.test.js
├── integration/
│   ├── quiz.test.js
│   ├── quizAttempt.test.js
│   └── distractor.test.js
└── performance/
    └── load-test.yml
```

---

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration

# Run specific test file
npm test -- tests/unit/services/quiz/quizService.test.js
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Performance Tests

```bash
# Install Artillery globally
npm install -g artillery

# Run performance tests
artillery run tests/performance/load-test.yml

# Generate HTML report
artillery run --output report.json tests/performance/load-test.yml
artillery report report.json
```

---

## Test Coverage

### Unit Tests

#### Service Tests (5 files)

1. **quizService.test.js** (29 test cases)
   - `createQuiz()` - validation, defaults, duplicate checks
   - `getAllQuizzes()` - filtering by courseId, lessonId, isPublished
   - `getQuizById()` - retrieval, not found errors
   - `updateQuiz()` - edit restrictions on published quizzes
   - `deleteQuiz()` - cascade deletion, publish constraints
   - `publishQuiz()` - validation (requires questions)
   - `unpublishQuiz()` - state changes

2. **questionService.test.js** (40+ test cases)
   - `createQuestion()` - auto-order assignment, duplicate order check
   - `createQuestionWithOptions()` - validates option counts per question type
   - `getQuestionsByQuiz()` - retrieval with options populated
   - `getQuestionById()` - single question retrieval
   - `updateQuestion()` - edit restrictions
   - `deleteQuestion()` - cascade deletion of options

3. **optionService.test.js** (20+ test cases)
   - `createOption()` - duplicate text validation, true/false limits
   - `getOptionsByQuestion()` - retrieval
   - `updateOption()` - prevent questionId changes
   - `deleteOption()` - prevent deleting last correct option

4. **quizAttemptService.test.js** (15 test cases)
   - `submitQuizAttempt()` - scoring calculation (50%, 100%)
   - Max attempts validation
   - Time limit enforcement
   - `getAttemptById()` - retrieval with responses
   - `getUserQuizAttempts()` - filtering by user and quiz
   - `getQuizStatistics()` - average score, pass rate

5. **distractorService.test.js** (25 test cases)
   - `generateDistractors()` - Datamuse API calls, capitalization, deduplication
   - `generateHints()` - fallback hints, maxHints parameter
   - `getEducationalContext()` - synonyms and related words from API

#### Controller Tests (5 files)

1. **quizController.test.js** (14 test cases)
   - HTTP 201 on successful creation
   - HTTP 400 on validation errors
   - HTTP 404 on resource not found
   - Tests for all 7 endpoints

2. **questionController.test.js** (10 test cases)
   - Create with/without options
   - HTTP status codes
   - Request/response validation

3. **optionController.test.js** (8 test cases)
   - CRUD operations
   - Error handling
   - Response structure

4. **quizAttemptController.test.js** (8 test cases)
   - Attempt submission
   - Statistics retrieval
   - Authentication checks

5. **distractorController.test.js** (12 test cases)
   - Third-party API integration
   - Input validation
   - Authentication requirements

### Integration Tests (3 files)

1. **quiz.test.js**
   - Full CRUD flow with authentication
   - Publish/unpublish workflows
   - Role-based access control (ContentContributor)
   - Database persistence validation

2. **quizAttempt.test.js**
   - Complete quiz-taking flow
   - Scoring accuracy verification
   - Max attempts enforcement
   - Statistics calculation
   - End-to-end user experience

3. **distractor.test.js**
   - Real Datamuse API calls
   - Timeout handling (10s)
   - Authentication flow
   - Error handling for external service failures

---

## Unit Tests

### Service Layer Tests

Service tests mock the Mongoose models and verify business logic correctness.

**Pattern**:
```javascript
jest.mock("../../../../src/models/quiz/Quiz.js");

describe("quizService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create quiz with default isPublished:false", async () => {
    // Arrange
    Quiz.create = jest.fn().mockResolvedValue(mockData);
    
    // Act
    const result = await createQuiz(quizData);
    
    // Assert
    expect(result.isPublished).toBe(false);
  });
});
```

**Coverage**:
- ✅ All CRUD operations
- ✅ Validation rules
- ✅ Business logic constraints
- ✅ Error scenarios
- ✅ Edge cases (empty arrays, null values)

### Controller Layer Tests

Controller tests mock the service layer and verify HTTP response handling.

**Pattern**:
```javascript
jest.mock("../../../../src/service/quiz/quizService.js");

const mockResponse = () => ({
  created: jest.fn().mockReturnThis(),
  success: jest.fn().mockReturnThis(),
  badRequest: jest.fn().mockReturnThis(),
});

describe("quizController", () => {
  it("should return 201 on successful creation", async () => {
    const req = { body: { title: "Test" } };
    const res = mockResponse();
    
    await createQuiz(req, res);
    
    expect(res.created).toHaveBeenCalledWith(
      "Quiz created successfully",
      expect.any(Object)
    );
  });
});
```

**Coverage**:
- ✅ HTTP status codes (200, 201, 400, 401, 404, 500)
- ✅ Response structure validation
- ✅ Error message formatting
- ✅ Request parameter extraction

---

## Integration Tests

Integration tests use **MongoDB Memory Server** for isolated database testing and **Supertest** for HTTP requests.

### Setup Pattern

```javascript
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB(); // Clean database between tests
});

afterAll(async () => {
  await disconnectTestDB();
});
```

### Test Flow Examples

#### Quiz CRUD Flow
```javascript
it("should create, retrieve, update, and delete a quiz", async () => {
  const token = await getContributorToken();
  
  // Create
  const createRes = await request(app)
    .post("/api/quiz/quizzes")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Test Quiz", courseId: "..." });
  
  expect(createRes.status).toBe(201);
  
  // Retrieve
  const getRes = await request(app)
    .get(`/api/quiz/quizzes/${createRes.body.content._id}`);
  
  expect(getRes.status).toBe(200);
  
  // ... (update and delete)
});
```

#### Quiz Attempt Flow
```javascript
it("should submit attempt and calculate score correctly", async () => {
  // 1. Create quiz with questions
  const quiz = await createCompleteQuiz();
  
  // 2. Submit attempt
  const res = await request(app)
    .post("/api/quiz/attempts")
    .send({ quizId, refugeeId, responses: [...] });
  
  // 3. Verify scoring
  expect(res.body.content.score).toBe(100);
  expect(res.body.content.passed).toBe(true);
});
```

### Authentication Testing

Tests verify role-based access control:
- **ADMIN** - User management
- **CONTENT_CONTRIBUTOR** - Quiz creation/editing
- **REFUGEE** - Quiz taking

```javascript
it("should reject quiz creation without authentication", async () => {
  const res = await request(app)
    .post("/api/quiz/quizzes")
    .send({ title: "Test" });
  
  expect(res.status).toBe(401);
});
```

---

## Performance Tests

Performance tests use **Artillery** to simulate load and measure system performance.

### Test Configuration

```yaml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 10
      arrivalRate: 5
      name: "Warm up"
    - duration: 20
      arrivalRate: 5
      rampTo: 20
      name: "Ramp up"
    - duration: 30
      arrivalRate: 20
      name: "Sustained load"
```

### Quiz Scenarios

1. **Browse Published Quizzes** (weight: 6)
   - GET `/api/quiz/quizzes?isPublished=true`
   - Simulates users browsing available quizzes

2. **Generate Quiz Distractors** (weight: 2)
   - POST `/api/quiz/distractors/generate`
   - Tests third-party API integration under load

3. **View Quiz Statistics** (weight: 2)
   - GET `/api/quiz/attempts/statistics/:quizId`
   - Tests aggregation performance

### Metrics Monitored

- ✅ Response time (p50, p95, p99)
- ✅ Requests per second
- ✅ Error rate
- ✅ Successful responses
- ✅ Failed responses

---

## Test Patterns

### 1. Test Organization

Use descriptive `describe` blocks:
```javascript
describe("quizService", () => {
  describe("createQuiz", () => {
    it("should create quiz with default values", () => {});
    it("should validate required fields", () => {});
  });
});
```

### 2. Mock Setup

Clear mocks before each test:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Assertions

Use specific matchers:
```javascript
expect(result).toBeInstanceOf(Array);
expect(result.length).toBe(2);
expect(result).toHaveProperty("_id");
expect(mockFn).toHaveBeenCalledWith("expected", "args");
```

### 4. Error Testing

```javascript
it("should throw error when quiz not found", async () => {
  Quiz.findById = jest.fn().mockResolvedValue(null);
  
  await expect(getQuizById("nonexistent"))
    .rejects.toThrow("Quiz not found");
});
```

### 5. Async Testing

Always use async/await:
```javascript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

---

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe expected behavior
3. **Coverage**: Test happy paths, edge cases, and error scenarios
4. **Speed**: Mock external dependencies (databases, APIs)
5. **Cleanup**: Reset state between tests
6. **Documentation**: Comment complex test scenarios

---

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm test -- tests/unit
      - name: Run integration tests
        run: npm test -- tests/integration
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
```bash
# Increase timeout for specific tests
it("should handle long operation", async () => {
  // test code
}, 10000); // 10 second timeout
```

**Issue**: MongoDB connection errors
```bash
# Ensure MongoDB Memory Server is installed
npm install --save-dev mongodb-memory-server
```

**Issue**: Port conflicts in integration tests
```bash
# Kill processes using port 5000
npx kill-port 5000
```

---

## Contributing

When adding new quiz features:

1. ✅ Write unit tests for service layer
2. ✅ Write unit tests for controller layer
3. ✅ Write integration tests for API endpoints
4. ✅ Update performance tests if needed
5. ✅ Run full test suite before committing
6. ✅ Ensure coverage stays above 80%

---

## Test Summary

| Test Type | Files | Test Cases | Purpose |
|-----------|-------|------------|---------|
| **Unit Tests (Services)** | 5 | 129+ | Business logic validation |
| **Unit Tests (Controllers)** | 5 | 52+ | HTTP layer validation |
| **Integration Tests** | 3 | 30+ | End-to-end workflows |
| **Performance Tests** | 1 | 3 scenarios | Load testing |
| **TOTAL** | **13+** | **211+** | **Comprehensive coverage** |

---

**Last Updated**: 2024
**Maintained By**: AF_Project Development Team
