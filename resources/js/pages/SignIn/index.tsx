import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useNotification } from '@/hooks';
import { dashboardRoute } from '@/routes/routeConfig';
import { loginSchema, type LoginFormData } from '@/schemas';

function SignIn() {
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully signed in to your account.',
      });
      navigate(dashboardRoute);
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Sign in failed',
        message: err.response?.data?.message || 'Please check your credentials and try again.',
      });
      setError('root', {
        type: 'server',
        message: err.response?.data?.message || 'Login failed',
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6"
      style={{
        backgroundImage: 'url(/assets/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-secondary/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <img
                src="/assets/logo.png"
                alt="Bunn DJ Planning Logo"
                className="h-10 sm:h-12 w-auto object-contain"
                style={{ aspectRatio: '160/51' }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand mb-2">Welcome Back, DJ!</h1>
            <p className="text-white text-sm sm:text-base">Sign in to manage your wedding events</p>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-sm">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-secondary text-sm sm:text-base ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-brand focus:border-brand'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white text-secondary text-sm sm:text-base ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-brand focus:border-brand'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-400 text-secondary font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing You In...
                </div>
              ) : (
                'Access Your DJ Dashboard'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-white text-xs sm:text-sm mb-1">New to DJ Planning Hub?</p>
            <Link
              to="/signup"
              className="text-brand hover:text-brand-dark font-medium text-sm sm:text-base"
            >
              Create your DJ account
            </Link>
          </div>

          <div className="mt-3 sm:mt-4 text-center">
            <a href="#" className="text-brand hover:text-brand-dark text-xs sm:text-sm">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
