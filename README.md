# Expenses

A comprehensive web application for personal finance management, expense tracking, and budgeting.

## Description
This project was created to help users track and manage their personal finances effectively. It provides a complete solution for monitoring expenses, managing income, setting budgets, and visualizing spending patterns through detailed statistics and reports.

Originally built with JavaScript (both frontend and backend), the project has evolved to use TypeScript and React for the frontend and Java Spring Boot for the backend, combined in a single repository for easier development and deployment.

## Features
- **Expense Management**
  - Add, edit, and delete expenses
  - Categorize expenses
  - Filter expenses by date, category, and amount
  - Bulk operations for expenses

- **Income Tracking**
  - Record and manage income sources
  - Track recurring income

- **Budget Planning**
  - Create and manage budgets
  - Set spending limits by category
  - Track budget progress

- **Statistics and Reporting**
  - View monthly and yearly expense summaries
  - Analyze spending patterns
  - Visual charts and graphs for better insights
  - Cash flow visualization (income vs. expenses over time)
  - Category comparison charts to track spending changes between periods
  - Pie charts showing expense distribution by category

- **User Management**
  - User registration and authentication
  - Profile management
  - Secure access with JWT authentication

- **Multi-currency Support**
  - Track expenses in different currencies
  - Currency conversion

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine UI components
- **Charts**: Recharts and @mantine/charts
- **HTTP Client**: Axios
- **Routing**: React Router
- **Testing**: Vitest with React Testing Library

### Backend
- **Framework**: Spring Boot 3.3.5
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **API Documentation**: SpringDoc OpenAPI
- **ORM**: Spring Data JPA

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

### Frontend Setup
1. Navigate to the `ui` directory:
   ```
   cd ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   This will start the development server at http://localhost:3000.

### Backend Setup
1. Configure the database connection in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/expenses_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

2. Navigate to the `backend` directory:
   ```
   cd backend
   ```

3. Build the application:
   ```
   mvn clean install
   ```

4. Run the application:
   ```
   mvn spring-boot:run
   ```
   This will start the backend server at http://localhost:8080.

## Testing
- **Frontend Tests**: Run `npm test` in the `ui` directory
- **Backend Tests**: Run `mvn test -Pexecute-integration-tests` in the `backend` directory

## Development
- **Frontend Linting**: Run `npm run lint` in the `ui` directory
- **Frontend Type Checking**: Run `npm run type-check` in the `ui` directory
- **Backend API Documentation**: Available at http://localhost:8080/api-docs when the backend is running

## API Client Generation
The frontend uses NSwag to generate TypeScript clients from the backend OpenAPI specification:

```
cd ui
npm run nswag
```

This generates client code in `src/models/clients.ts` based on the specification in `src/utils/nswag.json`.

## Building for Production

### Frontend
To build the frontend for production:

```
cd ui
npm run build
```

The build output will be in the `ui/dist` directory.

### Backend
To build the backend for production:

```
cd backend
mvn clean package -Pprod
```

This will create a JAR file in the `backend/target` directory that can be deployed to a production environment.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
