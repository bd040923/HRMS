# API Endpoints Testing Guide

## Base URL
```
http://localhost:3001
```

## Quick Test (Browser)

Simply open these URLs in your browser:

### 1. Root Endpoint
```
http://localhost:3001/
```
**Expected**: JSON with all available endpoints

### 2. Health Check
```
http://localhost:3001/api/health
```
**Expected**: 
```json
{
  "status": "ok",
  "database": "connected",
  "schema": "hrms_data",
  "tables_found": 11,
  "table_access": true
}
```

### 3. Diagnostic
```
http://localhost:3001/api/diagnostic
```
**Expected**: Detailed database information including tables and row counts

### 4. Simple Test
```
http://localhost:3001/api/test
```
**Expected**: 
```json
{
  "message": "Backend connected successfully"
}
```

---

## Main API Endpoints

### Job Titles

#### Get All Job Titles
```
GET http://localhost:3001/api/job-titles
```
**Expected**: Array of job titles
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "description": "...",
    "status": "active"
  }
]
```

---

### Vacancies

#### Get All Vacancies
```
GET http://localhost:3001/api/vacancies
```

#### Get Vacancies with Filters
```
GET http://localhost:3001/api/vacancies?jobTitle=Software Engineer
GET http://localhost:3001/api/vacancies?status=active
GET http://localhost:3001/api/vacancies?vacancy=Developer
GET http://localhost:3001/api/vacancies?hiringManager=John Doe
```

#### Get Single Vacancy
```
GET http://localhost:3001/api/vacancies/1
```

#### Create Vacancy
```
POST http://localhost:3001/api/vacancies
Content-Type: application/json

{
  "name": "Senior Developer Position",
  "jobTitleId": 1,
  "hiringManagerId": 1,
  "description": "We are looking for a senior developer...",
  "numberOfPositions": 2,
  "status": "active",
  "publishedDate": "2024-01-15",
  "closingDate": "2024-02-15"
}
```

#### Update Vacancy
```
PUT http://localhost:3001/api/vacancies/1
Content-Type: application/json

{
  "name": "Updated Position Name",
  "jobTitleId": 1,
  "status": "closed"
}
```

#### Delete Vacancy
```
DELETE http://localhost:3001/api/vacancies/1
```

---

### Candidates

#### Get All Candidates
```
GET http://localhost:3001/api/candidates
```

#### Get Candidates with Filters
```
GET http://localhost:3001/api/candidates?status=Application Initiated
GET http://localhost:3001/api/candidates?candidateName=John
GET http://localhost:3001/api/candidates?jobTitle=Software Engineer
GET http://localhost:3001/api/candidates?vacancy=Developer
GET http://localhost:3001/api/candidates?keywords=Java,Python
GET http://localhost:3001/api/candidates?dateFrom=2024-01-01&dateTo=2024-12-31
GET http://localhost:3001/api/candidates?methodOfApplication=Manual
```

#### Get Single Candidate
```
GET http://localhost:3001/api/candidates/1
```

#### Create Candidate
```
POST http://localhost:3001/api/candidates
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "contactNumber": "+1234567890",
  "keywords": "Java, Spring, PostgreSQL",
  "comment": "Excellent candidate",
  "dateOfApplication": "2024-01-15",
  "status": "Application Initiated",
  "methodOfApplication": "Manual",
  "vacancyIds": [1, 2]
}
```

#### Update Candidate
```
PUT http://localhost:3001/api/candidates/1
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "status": "Shortlisted"
}
```

#### Delete Candidate
```
DELETE http://localhost:3001/api/candidates/1
```

---

### Employees

#### Get All Employees
```
GET http://localhost:3001/api/employees
```

#### Get Employees (Compact View for Dropdowns)
```
GET http://localhost:3001/api/employees?view=compact
```

#### Get Employees with Filters
```
GET http://localhost:3001/api/employees?employeeId=EMP001
GET http://localhost:3001/api/employees?employeeName=John
GET http://localhost:3001/api/employees?jobTitle=Manager
GET http://localhost:3001/api/employees?employmentStatus=Full Time
GET http://localhost:3001/api/employees?subUnit=IT
GET http://localhost:3001/api/employees?supervisor=Jane Smith
GET http://localhost:3001/api/employees?include=Current Employees Only
```

#### Get Single Employee
```
GET http://localhost:3001/api/employees/1
```

#### Create Employee
```
POST http://localhost:3001/api/employees
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567890",
  "jobTitle": "Software Engineer",
  "employmentStatus": "Full Time",
  "subUnit": "IT",
  "supervisorName": "John Manager",
  "status": "active",
  "hireDate": "2024-01-01"
}
```

#### Update Employee
```
PUT http://localhost:3001/api/employees/1
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "Senior Software Engineer"
}
```

#### Delete Employee
```
DELETE http://localhost:3001/api/employees/1
```

---

## PowerShell Testing Commands

### Test All Endpoints
```powershell
.\test-api.ps1
```

### Individual Tests

#### Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" | Select-Object StatusCode, Content
```

#### Get Job Titles
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/job-titles"
$response | ConvertTo-Json
```

#### Get Vacancies
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/vacancies"
$response | ConvertTo-Json
```

#### Get Candidates
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/candidates"
$response | ConvertTo-Json
```

#### Get Employees
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/employees"
$response | ConvertTo-Json
```

#### Create Vacancy (POST)
```powershell
$body = @{
    name = "Test Vacancy"
    jobTitleId = 1
    status = "active"
    numberOfPositions = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/vacancies" -Method Post -Body $body -ContentType "application/json"
```

#### Create Candidate (POST)
```powershell
$body = @{
    firstName = "Test"
    lastName = "Candidate"
    email = "test@example.com"
    status = "Application Initiated"
    methodOfApplication = "Manual"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/candidates" -Method Post -Body $body -ContentType "application/json"
```

---

## cURL Commands (for Git Bash or WSL)

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Get All Job Titles
```bash
curl http://localhost:3001/api/job-titles
```

### Get All Vacancies
```bash
curl http://localhost:3001/api/vacancies
```

### Get All Candidates
```bash
curl http://localhost:3001/api/candidates
```

### Get All Employees
```bash
curl http://localhost:3001/api/employees
```

### Create Vacancy (POST)
```bash
curl -X POST http://localhost:3001/api/vacancies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vacancy",
    "jobTitleId": 1,
    "status": "active",
    "numberOfPositions": 1
  }'
```

### Create Candidate (POST)
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Candidate",
    "email": "test@example.com",
    "status": "Application Initiated",
    "methodOfApplication": "Manual"
  }'
```

---

## Testing Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Health check returns `{"status": "ok"}`
- [ ] Diagnostic shows database connection
- [ ] GET endpoints return data (or empty arrays)
- [ ] POST endpoints create new records
- [ ] PUT endpoints update records
- [ ] DELETE endpoints remove records
- [ ] Filters work correctly on GET endpoints

---

## Expected Responses

### Success (200 OK)
```json
{
  "id": 1,
  "name": "...",
  ...
}
```

### Created (201 Created)
```json
{
  "id": 1,
  "name": "...",
  ...
}
```

### Not Found (404)
```json
{
  "error": "Vacancy not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to fetch vacancies"
}
```

---

## Quick Test Script

Save this as `quick-test.ps1`:

```powershell
$baseUrl = "http://localhost:3001"

Write-Host "Testing API Endpoints..." -ForegroundColor Green

# Test 1: Health
Write-Host "`n1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "$baseUrl/api/health"
    Write-Host "   ✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}

# Test 2: Job Titles
Write-Host "`n2. Job Titles:" -ForegroundColor Yellow
try {
    $jobs = Invoke-RestMethod "$baseUrl/api/job-titles"
    Write-Host "   ✅ Found $($jobs.Count) job titles" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}

# Test 3: Vacancies
Write-Host "`n3. Vacancies:" -ForegroundColor Yellow
try {
    $vacancies = Invoke-RestMethod "$baseUrl/api/vacancies"
    Write-Host "   ✅ Found $($vacancies.Count) vacancies" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}

# Test 4: Candidates
Write-Host "`n4. Candidates:" -ForegroundColor Yellow
try {
    $candidates = Invoke-RestMethod "$baseUrl/api/candidates"
    Write-Host "   ✅ Found $($candidates.Count) candidates" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}

# Test 5: Employees
Write-Host "`n5. Employees:" -ForegroundColor Yellow
try {
    $employees = Invoke-RestMethod "$baseUrl/api/employees"
    Write-Host "   ✅ Found $($employees.Count) employees" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed" -ForegroundColor Red
}

Write-Host "`n✅ Testing Complete!" -ForegroundColor Green
```

Run with: `.\quick-test.ps1`

