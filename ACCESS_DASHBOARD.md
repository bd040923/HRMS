# How to Access the Dashboard

## Step 1: Start the Development Server

```bash
cd orangehrm\src\client
npm run serve
```

Wait for the server to start. You should see output like:
```
webpack compiled successfully
```

## Step 2: Open in Browser

Open your browser and go to:
```
http://localhost:8080
```

## Step 3: Login

You will see the login page. Use these credentials:

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`

**Regular User Account:**
- Username: `user`
- Password: `User@123`

## Step 4: Access Dashboard

After logging in, you will be automatically redirected to the dashboard at:
```
http://localhost:8080/dashboard
```

## What You Should See

- **Top Header**: Purple header with logo, notification bell (with "2"), clock icon, company name, and profile dropdown
- **Dashboard Title**: "Dashboard" heading
- **12 Module Icons**: 
  - Employees (purple)
  - Departments (grey)
  - Projects (green)
  - Calendar (blue)
  - Attendances (red)
  - Time Off (yellow)
  - Payroll (orange)
  - Expenses (blue)
  - Recruitment (purple)
  - Performance (teal)
  - Training (purple)
  - Reports (orange)

## Troubleshooting

### If you see a blank page:
1. Check the browser console (F12) for errors
2. Make sure you're logged in
3. Try navigating directly to `/dashboard` after login

### If you see the login page:
- You need to log in first with the credentials above

### If you see "Access Denied":
- Make sure you're using the admin account for full access

## Direct Dashboard URL

Once logged in, you can access the dashboard directly at:
```
http://localhost:8080/dashboard
```

