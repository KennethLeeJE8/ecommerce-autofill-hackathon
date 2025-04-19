'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    clothingSize: '',
    shoeSize: '',
    favoriteColors: '',
  });
  const [status, setStatus] = useState('');

  // Load saved data when component mounts
  useEffect(() => {
    const loadData = async () => {
      const savedData = localStorage.getItem('personalInfo');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        
        // Try to fetch from database
        try {
          const response = await fetch(
            `/api/personal-info?firstName=${encodeURIComponent(parsed.firstName)}&lastName=${encodeURIComponent(parsed.lastName)}`
          );
          if (response.ok) {
            const dbData = await response.json();
            if (dbData) {
              setFormData({
                firstName: dbData.first_name,
                lastName: dbData.last_name,
                clothingSize: dbData.clothing_size,
                shoeSize: dbData.shoe_size.toString(),
                favoriteColors: dbData.favorite_colors,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    
    try {
      const response = await fetch('/api/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        localStorage.setItem('personalInfo', JSON.stringify(formData));
        setStatus('Saved successfully!');
      } else {
        setStatus('Error saving data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setStatus('Error saving data');
    }

    setTimeout(() => setStatus(''), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <h1 className="text-3xl font-bold mb-8">Personal Information Form</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="clothingSize" className="block text-sm font-medium mb-2">
              Clothing Size
            </label>
            <select
              id="clothingSize"
              name="clothingSize"
              value={formData.clothingSize}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <div>
            <label htmlFor="shoeSize" className="block text-sm font-medium mb-2">
              Shoe Size
            </label>
            <input
              type="number"
              id="shoeSize"
              name="shoeSize"
              value={formData.shoeSize}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="20"
              required
            />
          </div>

          <div>
            <label htmlFor="favoriteColors" className="block text-sm font-medium mb-2">
              Favorite Colors (comma-separated)
            </label>
            <input
              type="text"
              id="favoriteColors"
              name="favoriteColors"
              value={formData.favoriteColors}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., blue, red, green"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>

        {status && (
          <div className={`text-center ${status.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
