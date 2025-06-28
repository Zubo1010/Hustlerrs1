import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LocationSelector from '../../common/LocationSelector'; // Correct import

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    contactType: 'email',
    contactValue: '',
    password: '',
    confirmPassword: '',
    role: 'Hustler',
    location: '', // Initialize location as an empty string or null
    age: '',
    businessName: '',
    coordinates: {
      type: 'Point',
      coordinates: [null, null]
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ageOptions = Array.from({ length: 50 }, (_, i) => i + 16); // 16-65 years

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        // Role selection - always valid as it has a default
        break;

      case 2:
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Name is required 😅';
        }
        // Check email or phone number based on contactType
        if (formData.contactType === 'email') {
          if (!formData.contactValue.trim()) { // Corrected: use contactValue
            newErrors.contactValue = 'Email is required 😅';
          } else if (!/^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/.test(formData.contactValue)) { // Corrected: use contactValue
            newErrors.contactValue = 'Please enter a valid email 😅';
          }
        } else if (formData.contactType === 'phone') {
           if (!formData.contactValue.trim()) { // Corrected: use contactValue
            newErrors.contactValue = 'Phone number is required 😅';
          } else if (!/^(\\\\+880|880|0)?1[3-9]\\\\d{8}$/.test(formData.contactValue)) { // Corrected: use contactValue
            newErrors.contactValue = 'Please enter a valid BD phone number 😅';
          }
        }
        if (!formData.password) {
          newErrors.password = 'Password is required 😅';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters 😅';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password 😅';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Oops! Passwords don\'t match 😅';
        }
        break;

      case 3:
        if(!formData.location || !formData.location.division || !formData.location.district || !formData.location.upazila) {
          newErrors.location = 'Please select a valid location 😅';
        }
        if (formData.role === 'Hustler') {
          if (!formData.age) {
            newErrors.age = 'Please select your age 😅';
          } else if (parseInt(formData.age) < 16) {
            newErrors.age = 'You must be at least 16 years old 😅';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    // If on the first step and the role is 'Hustler', redirect to the special form.
    if (currentStep === 1 && formData.role === 'Hustler') {
      navigate('/hustler-register');
      return; // Stop here
    }

    // For all other cases, validate and go to the next step of the multi-step form.
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const loc = formData.location;

    // Final validation check
    const finalValidation = validateStep(currentStep);
    if (!finalValidation) {
      validateStep(currentStep);
      return;
    }

    // Additional check for required fields
    const missingFields = [];
    // Add checks before trimming
    if (!formData.fullName || !formData.fullName.trim()) missingFields.push('Full Name');
    if (!formData.contactValue || !formData.contactValue.trim()) missingFields.push('Contact Info');
    if (!formData.password) missingFields.push('Password');
    if (!loc || !loc.division || !loc.district || !loc.upazila) missingFields.push('Location');
    if (formData.role === 'Hustler' && !formData.age) missingFields.push('Age');

    if (missingFields.length > 0) {
      setErrors({ submit: `Please fill in: ${missingFields.join(', ')}` });
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Dummy coordinates – later you can use real reverse geocoding
      let coordinates = {
        type: 'Point',
        coordinates: [null, null]
      };

      // Prepare data for API
      const registerData = {
        fullName: formData.fullName.trim(),
        role: formData.role,
        password: formData.password,
        [formData.contactType === 'phone' ? 'phoneNumber' : 'email']: formData.contactValue.trim(), // Correctly map contactType to backend field
        location: formData.location,
        coordinates: coordinates,

        ...(formData.role === 'Hustler' && formData.age && {
          age: parseInt(formData.age)
        })
      };

      console.log('Sending registration data:', registerData);

      const result = await register(registerData);

      if (result.success) {
        setCurrentStep(4); // Show success step
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An error occurred during registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };


  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="text-center">
      <div className="text-4xl mb-4">👋</div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Who are you today?</h2>
      <p className="text-gray-600 mb-8">Let's get you in the game 💼</p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, role: 'Hustler' }))}
          className={`w-full p-6 rounded-lg border-2 transition-all ${
            formData.role === 'Hustler'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-2">🎓</div>
          <div className="text-lg font-medium text-gray-900">I'm a Hustler</div>
          <div className="text-sm text-gray-600">I want to work</div>
        </button>

        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, role: 'Job Giver' }))}
          className={`w-full p-6 rounded-lg border-2 transition-all ${
            formData.role === 'Job Giver'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl mb-2">🧑‍💼</div>
          <div className="text-lg font-medium text-gray-900">I'm a Job Giver</div>
          <div className="text-sm text-gray-600">I need help</div>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📝</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic Info</h2>
        <p className="text-gray-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}\
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
          <div className="flex space-x-2 mb-2">\
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, contactType: 'email', contactValue: '' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.contactType === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, contactType: 'phone', contactValue: '' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.contactType === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📱 Phone
            </button>
          </div>
          <input
            type={formData.contactType === 'phone' ? 'tel' : 'email'}
            name="contactValue"
            value={formData.contactValue}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactValue ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder={formData.contactType === 'phone' ? 'Enter your phone number' : 'Enter your email address'}
          />
          {errors.contactValue && <p className="text-red-500 text-sm mt-1">{errors.contactValue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📍</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Area</h2>
        <p className="text-gray-600">This helps us find jobs near you</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select your area</label>
        {/* Use LocationSelector component */}
        <LocationSelector
          value={formData.location} // Pass the current location state
          onChange={(locationData) => { // Use onChange prop
            setFormData(prev => ({ ...prev, location: locationData }));
            // Clear location error when a location is selected
            if (errors.location) {
              setErrors(prev => ({
                ...prev,
                location: ''
              }));
            }
          }}
          // Optional: Set readOnlyAddress prop
          // readOnlyAddress={true}
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
      </div>

      {formData.role === 'Hustler' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <select
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select your age</option>
            {ageOptions.map(age => (
              <option key={age} value={age}>{age} years old</option>
            ))}
          </select>
          {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
        </div>
      )}
    </div>
  );


  const renderStep4 = () => (
    <div className="text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        You're in, {formData.fullName}! Time to hustle 🔥
      </h2>
      <p className="text-gray-600 mb-6">Welcome to the Hustlers community!</p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h3 className="font-medium text-gray-900 mb-3">Account Summary:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>👤 <span className="font-medium">{formData.fullName}</span></div>
          <div>{formData.role === 'Hustler' ? '🎓' : '🧑‍💼'} <span className="font-medium">
            {formData.role}
          </span></div>
          <div>📍 <span className="font-medium">{formData.location?.upazila}, {formData.location?.district}, {formData.location?.division}</span></div> {/* Display location details */}
          {formData.role === 'Hustler' && formData.age && (
            <div>🎂 <span className="font-medium">{formData.age} years old</span></div>
          )}
          {formData.role === 'Job Giver' && formData.businessName && (
            <div>🏢 <span className="font-medium">{formData.businessName}</span></div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Let's Go! 🚀
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">Hustlers</h1>
          </Link>
          <p className="text-gray-600 mt-2">
            {currentStep < 4 ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </>
            ) : (
              'Welcome to the community!'
            )}
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep < 4 && renderStepIndicator()}

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  ← Back
                </button>
              )}

              <div className="flex-1" />

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
