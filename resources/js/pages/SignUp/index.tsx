import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { dashboardRoute } from '@/routes/routeConfig';
import { registerSchema, type RegisterFormData } from '@/schemas/auth';

function SignUp() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(
        data.name,
        data.email,
        data.username,
        data.password,
        data.password_confirmation,
        data.organization,
        data.phone
      );
      navigate(dashboardRoute);
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        // Set field-specific errors
        Object.keys(errors).forEach(field => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message: errors[field][0],
          });
        });
      } else {
        setError('root', {
          type: 'server',
          message: err.response?.data?.message || 'Registration failed',
        });
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/assets/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-secondary/80 backdrop-blur-sm rounded-xl shadow-lg max-w-lg w-full mx-4 border border-secondary-light">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/logo.png"
                alt="Bunn DJ Planning Logo"
                className="h-12 w-auto object-contain"
                style={{ aspectRatio: '160/51' }}
              />
            </div>
            <h1 className="text-3xl font-bold text-brand mb-2">Join DJ Planning Hub</h1>
            <p className="text-white">Create your DJ account and start planning amazing events</p>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-700 text-sm">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand mb-2">
                  Full Name *
                </label>{' '}
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-brand mb-2">
                  Username *
                </label>{' '}
                <input
                  type="text"
                  id="username"
                  {...register('username')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              {' '}
              <label htmlFor="email" className="block text-sm font-medium text-brand mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-brand mb-2">
                  DJ Company/Business *
                </label>
                <input
                  type="text"
                  id="organization"
                  {...register('organization')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.organization ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your DJ business name"
                />
                {errors.organization && (
                  <p className="text-red-600 text-sm mt-1">{errors.organization.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-brand mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a secure password"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm font-medium text-brand mb-2"
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  {...register('password_confirmation')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary ${
                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.password_confirmation && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-brand/10 border border-brand/30 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-brand mt-0.5 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm text-white font-medium">Welcome to the DJ Community!</p>
                  <p className="text-xs text-brand mt-1">
                    Join thousands of DJs who are streamlining their wedding planning process.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-brand/90 disabled:bg-gray-400 text-secondary font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
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
                  Creating Your DJ Account...
                </div>
              ) : (
                'Start Your DJ Journey'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 mb-1 text-sm">Already have an account?</p>
            <Link to="/signin" className="text-brand hover:text-brand-dark font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
