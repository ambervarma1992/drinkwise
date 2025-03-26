# DrinkWise

DrinkWise is a web application that helps users track and monitor their drinking habits responsibly. It provides real-time tracking of drinks, buzz levels, and session statistics.

## Features

- Real-time drink tracking
- Session management
- Buzz level monitoring
- Drink statistics and analytics
- Secure user authentication
- Responsive design

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Styling: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account and project

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/drinkwise.git
cd drinkwise
```

2. Set up environment variables:

Backend (.env):
```
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
PORT=3001
NODE_ENV="development"
```

3. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

4. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Deployment

The application is set up for deployment with:
- Frontend: Netlify
- Backend: Your preferred Node.js hosting (e.g., Heroku, Railway, etc.)
- Database: Supabase (Production project)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 