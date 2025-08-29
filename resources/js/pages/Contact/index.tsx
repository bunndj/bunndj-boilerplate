import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
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
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-secondary transition-colors duration-300" />
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
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
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
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-secondary transition-colors duration-300" />
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
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
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
