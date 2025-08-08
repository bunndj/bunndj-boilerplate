# Laravel React TypeScript Project

A modern full-stack web application combining Laravel backend with an embedded React + TypeScript frontend, styled with TailwindCSS 4 and configured with ESLint for code quality.

## 🚀 Tech Stack

- **Backend**: Laravel 12.x
- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS 4
- **Bundler**: Vite
- **Code Quality**: ESLint + TypeScript
- **Package Manager**: npm

## 📦 Features

- ✅ Laravel backend with API routes
- ✅ React frontend with TypeScript
- ✅ TailwindCSS 4 for modern styling
- ✅ ESLint configured for React + TypeScript
- ✅ Hot reload for development
- ✅ Production-ready build process
- ✅ API communication between frontend and backend
- ✅ Single deployment bundle

## 🛠️ Development Setup

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18
- npm

### Installation

1. **Install PHP dependencies**:

    ```bash
    composer install
    ```

2. **Install Node.js dependencies**:

    ```bash
    npm install
    ```

3. **Environment setup**:

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Database setup**:
    ```bash
    php artisan migrate
    ```

## 🎯 Available Scripts

### Development

- **Start development servers** (recommended):

    ```bash
    npm run dev:laravel
    ```

    This starts both Vite dev server and Laravel server concurrently.

- **Start frontend only**:

    ```bash
    npm run dev
    ```

- **Start Laravel server only**:
    ```bash
    php artisan serve
    ```

### Code Quality

- **Run ESLint**:

    ```bash
    npm run lint
    ```

- **Fix ESLint issues**:

    ```bash
    npm run lint:fix
    ```

- **TypeScript type checking**:
    ```bash
    npm run type-check
    ```

### Production

- **Build for production**:

    ```bash
    npm run build
    ```

- **Preview production build**:
    ```bash
    npm run preview
    ```

## 🌐 Project Structure

```
├── app/                    # Laravel application logic
├── resources/
│   ├── js/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── app.tsx        # React entry point
│   ├── css/
│   │   └── app.css        # TailwindCSS styles
│   └── views/
│       └── welcome.blade.php # Main HTML template
├── routes/
│   └── web.php            # API and web routes
├── public/                # Compiled assets (after build)
├── eslint.config.js       # ESLint configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.js         # Vite configuration
└── package.json           # Node.js dependencies and scripts
```

## 🔌 API Endpoints

The project includes example API endpoints:

- `GET /api/health` - Health check endpoint
- `GET /api/user` - Demo user data

These endpoints are used by the React frontend to demonstrate backend communication.

## 🚀 Deployment

### Building for Production

1. **Build the frontend**:

    ```bash
    npm run build
    ```

2. **Optimize Laravel**:
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

### Cloud Deployment

This setup is designed for easy deployment to cloud services:

- **Assets**: All frontend assets are compiled into the `public/build` directory
- **Single codebase**: Frontend and backend are bundled together
- **Environment variables**: Use `.env` for configuration
- **Database**: SQLite (default) or configure your preferred database

### Popular Deployment Options

- **Vercel**: Deploy with `@vercel/php` runtime
- **Heroku**: Use the official PHP buildpack
- **DigitalOcean App Platform**: Use PHP + Node.js buildpack
- **AWS Elastic Beanstalk**: PHP platform
- **Railway**: Automatic PHP detection

## 🔧 Configuration

### TailwindCSS

The project uses TailwindCSS 4 with the new `@import` and `@source` directives. Configuration is in `resources/css/app.css`.

### ESLint

ESLint is configured for React + TypeScript with recommended rules. See `eslint.config.js` for the full configuration.

### TypeScript

TypeScript configuration is in `tsconfig.json` with React JSX support and path mapping for easy imports.

### Vite

Vite configuration includes:

- React plugin for JSX/TSX support
- Laravel Vite plugin for asset compilation
- TailwindCSS plugin for styling
- Path aliases for clean imports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
