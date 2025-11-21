'use client';

import React from 'react';
import Image from 'next/image';
import { FormField, FormLayout } from '@/app/types/form';

interface FormPreviewProps {
  form: FormLayout;
  theme?: 'light' | 'espresso';
}

export default function FormPreview({ form, theme = 'light' }: FormPreviewProps) {
  const isEspresso = theme === 'espresso';

  const containerClass = isEspresso ? 'bg-[#1C1917] border-[#FB923C]/30' : 'bg-white border-gray-200';
  const textClass = isEspresso ? 'text-[#FAFAFA]' : 'text-gray-900';
  const subTextClass = isEspresso ? 'text-[#FAFAFA]/70' : 'text-gray-600';
  const inputClass = isEspresso
    ? 'w-full px-3 py-2 border border-[#FB923C]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FB923C] bg-white/5 text-[#FAFAFA] placeholder-white/30'
    : 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500';
  const linkClass = isEspresso ? 'text-[#FB923C] underline' : 'text-blue-600 underline';

  const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return (
      <div className={`${subTextClass} whitespace-pre-line`}>
        {parts.map((part, idx) => {
          if (urlRegex.test(part)) {
            return (
              <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-words`}>
                {part}
              </a>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            key={field.id}
            placeholder={field.placeholder}
            className={`${inputClass} resize-vertical`}
            rows={3}
            disabled
          />
        );

      case 'select':
        return (
          <select
            key={field.id}
            className={`${inputClass} ${isEspresso ? 'bg-[#1C1917]' : 'bg-white'}`}
            disabled
          >
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  className={`h-4 w-4 focus:ring-2 ${isEspresso ? 'text-[#FB923C] focus:ring-[#FB923C] border-[#FB923C]/30 bg-transparent' : 'text-blue-600 focus:ring-blue-500 border-gray-300'}`}
                  disabled
                />
                <span className={`ml-2 text-sm ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  name={field.id}
                  value={option}
                  className={`h-4 w-4 rounded focus:ring-2 ${isEspresso ? 'text-[#FB923C] focus:ring-[#FB923C] border-[#FB923C]/30 bg-transparent' : 'text-blue-600 focus:ring-blue-500 border-gray-300'}`}
                  disabled
                />
                <span className={`ml-2 text-sm ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            key={field.id}
            type="file"
            className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isEspresso
                ? 'file:bg-[#FB923C] file:text-[#1C1917] hover:file:bg-[#FCD34D]'
                : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              }`}
            disabled
          />
        );

      case 'image':
        return (
          <div key={field.id} className="space-y-2">
            <input
              type="file"
              accept="image/*"
              className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isEspresso
                  ? 'file:bg-[#FB923C] file:text-[#1C1917] hover:file:bg-[#FCD34D]'
                  : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                }`}
              disabled
            />
            <p className={`text-xs ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-500'}`}>Upload an image file</p>
          </div>
        );

      case 'admin-image':
        return (
          <div key={field.id} className="space-y-2">
            {field.imageUrl ? (
              <div className="text-center">
                <div className="relative mx-auto h-auto w-full max-w-md">
                  <Image
                    src={field.imageUrl}
                    alt={field.label}
                    width={800}
                    height={600}
                    className={`h-auto w-full rounded-lg border ${isEspresso ? 'border-[#FB923C]/30' : ''}`}
                  />
                </div>
                <p className={`text-sm mt-2 ${subTextClass}`}>{field.label}</p>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isEspresso ? 'border-[#FB923C]/30' : 'border-gray-300'}`}>
                <p className={isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-500'}>No image uploaded</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            key={field.id}
            type={field.type}
            placeholder={field.placeholder}
            className={inputClass}
            disabled
          />
        );
    }
  };

  return (
    <div className={`border rounded-lg p-6 shadow-sm ${containerClass}`}>
      {/* Header image on top */}
      {form.imageUrl && (
        <div className="mb-4">
          <div className="relative w-full pb-[25%] rounded-lg overflow-hidden">
            <Image
              src={form.imageUrl}
              alt="Form header"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${textClass}`}>{form.title}</h2>
        {form.description && linkify(form.description)}
      </div>

      <form className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            {field.type !== 'admin-image' && (
              <label className={`block text-sm font-medium ${isEspresso ? 'text-[#FAFAFA]/90' : 'text-gray-700'}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {field.validation && (
              <div className={`text-xs ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-500'}`}>
                {field.validation.minLength && `Min length: ${field.validation.minLength}`}
                {field.validation.maxLength && `Max length: ${field.validation.maxLength}`}
                {field.validation.min && `Min value: ${field.validation.min}`}
                {field.validation.max && `Max value: ${field.validation.max}`}
              </div>
            )}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 font-semibold ${isEspresso
                ? 'bg-[#FB923C] text-[#1C1917] hover:bg-[#FCD34D] focus:ring-[#FB923C]'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            disabled
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
}