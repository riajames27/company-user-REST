# Company User Management
A web application for managing companies and users.
The backend is built using Node.js and Express, implementing a RESTful API for CRUD operations.
The frontend is built with React.
You can use tools like Postman to test the API endpoints. 

## Setup Instructions

### Prerequisites
- MySQL installed on your local machine.
- Node.js and npm installed.

### Database Setup
1. Create a new MySQL database named `company_user_management`.
2. Run the following SQL commands to create the necessary tables:

```sql
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    designation VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    company_id INT,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
````

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DB_HOST=your_host_here
DB_USER=your_username_here
DB_PASSWORD=your_password_here
DB_NAME=your_database_name_here
```

### Running the Application

#### BACKEND (Node.js)

1. Navigate to backend folder:

```bash
cd company-user-management
```

2. Install dependencies:

```bash
npm install
```

3. Start backend server:

```bash
node server.js
```

#### FRONTEND (React)

1. Navigate to frontend folder:

```bash
cd company-user-management-ui
```

2. Install dependencies:

```bash
npm install
```

3. Start the React app:

```bash
npm start
```




