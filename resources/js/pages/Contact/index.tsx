import React, { useState } from 'react';
import { useSubmitContactForm, useNotification } from '@/hooks';

function Contact() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const { mutate: submitContactForm, isPending } = useSubmitContactForm();
  const { addNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitContactForm(formData, {
      onSuccess: response => {
        if (response.success) {
          addNotification({
            type: 'success',
            title: 'Message sent successfully!',
            message: 'We have received your message and will get back to you soon.',
          });
          setFormData({ subject: '', message: '' }); // Reset form
        } else {
          addNotification({
            type: 'error',
            title: 'Failed to send message',
            message: response.message || 'Please check your information and try again.',
          });
        }
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message || 'Failed to send message. Please try again.';
        addNotification({
          type: 'error',
          title: 'Failed to send message',
          message: message,
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 animate-fade-in">
              Contact Us
            </h1>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-200">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 animate-slide-in-left">
                Contact Form
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-white mb-2 animate-slide-up animation-delay-300"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary transition-all duration-200 hover:shadow-md"
                    placeholder="Enter your subject"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white mb-2 animate-slide-up animation-delay-400"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-white text-secondary resize-none transition-all duration-200 hover:shadow-md"
                    placeholder="Enter your message"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-secondary font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 animate-glow"
                >
                  {isPending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 hover-lift animate-slide-up animation-delay-300">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 animate-slide-in-left">
                Our Contact Information
              </h2>

              <div className="space-y-6 sm:space-y-8">
                {/* Phone */}
                <div className="flex items-start space-x-4 animate-slide-up animation-delay-400 hover:bg-white/5 p-3 rounded-lg transition-all duration-300 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-brand group-hover:rotate-12 transition-all duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-secondary transition-colors duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-brand transition-colors duration-300">
                      Phone
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">919.785.9001</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4 animate-slide-up animation-delay-500 hover:bg-white/5 p-3 rounded-lg transition-all duration-300 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-brand transition-colors duration-300">
                      Email
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">info@bunndjcompany.com</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4 animate-slide-up animation-delay-600 hover:bg-white/5 p-3 rounded-lg transition-all duration-300 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-brand transition-all duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-secondary transition-colors duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-brand transition-colors duration-300">
                      Address
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">
                      302 Jefferson St., Suite 160
                      <br />
                      Raleigh, NC 27605
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start space-x-4 animate-slide-up animation-delay-700 hover:bg-white/5 p-3 rounded-lg transition-all duration-300 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand rounded-full flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-brand transition-colors duration-300">
                      Website
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base">www.bunndjcompany.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;
