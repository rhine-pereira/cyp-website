'use client';

import React from 'react';
import Image from 'next/image';
import { FormField } from '@/app/types/form';
import { X, Plus, Trash2 } from 'lucide-react';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  theme?: 'light' | 'espresso';
}

export default function FieldEditor({ field, onUpdate, onDelete, theme = 'light' }: FieldEditorProps) {
  const isEspresso = theme === 'espresso';

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const addOption = () => {
    const newOptions = [...(field.options || []), ''];
    updateField({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    updateField({ options: newOptions });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('isAdminUpload', 'true');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateField({ imageUrl: result.url });
      } else {
        alert(`Failed to upload image: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const removeImage = () => {
    updateField({ imageUrl: undefined });
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'tel', label: 'Phone' },
    { value: 'url', label: 'URL' },
    { value: 'password', label: 'Password' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'radio', label: 'Radio' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'datetime-local', label: 'DateTime' },
    { value: 'file', label: 'File' },
    { value: 'image', label: 'Image Upload' },
    { value: 'admin-image', label: 'Display Image (Admin)' },
  ];

  const containerClass = isEspresso ? 'bg-[#1C1917] border-[#FB923C]/30' : 'bg-white border-gray-200';
  const textClass = isEspresso ? 'text-[#FAFAFA]' : 'text-gray-900';
  const subTextClass = isEspresso ? 'text-[#FAFAFA]/70' : 'text-gray-700';
  const inputClass = isEspresso
    ? 'w-full border border-[#FB923C]/30 rounded-md px-3 py-2 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#FB923C] text-[#FAFAFA] placeholder-white/30'
    : 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500';

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${containerClass}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${textClass}`}>Field Editor</h3>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Field Type */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
            Field Type
          </label>
          <select
            value={field.type}
            onChange={(e) => updateField({ type: e.target.value as FormField['type'] })}
            className={inputClass}
            style={isEspresso ? { backgroundColor: '#1C1917' } : {}}
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            className={inputClass}
            placeholder="Enter field label"
          />
        </div>

        {/* Placeholder (not used for select, radio, checkbox) */}
        {!(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div>
            <label className={`block text-sm font-medium mb-1 ${subTextClass}`}>
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              className={inputClass}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={field.required}
            onChange={(e) => updateField({ required: e.target.checked })}
            className={`h-4 w-4 rounded focus:ring-2 ${isEspresso ? 'text-[#FB923C] focus:ring-[#FB923C] border-[#FB923C]/30 bg-transparent' : 'text-blue-600 focus:ring-blue-500 border-gray-300'}`}
          />
          <label htmlFor="required" className={`ml-2 text-sm font-medium ${subTextClass}`}>
            Required field
          </label>
        </div>

        {/* Image upload for admin-image */}
        {field.type === 'admin-image' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${subTextClass}`}>
              Upload Image
            </label>
            {field.imageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-32">
                  <Image
                    src={field.imageUrl}
                    alt="Uploaded image"
                    fill
                    sizes="100vw"
                    className={`object-cover rounded-lg border ${isEspresso ? 'border-[#FB923C]/30' : ''}`}
                  />
                </div>
                <button
                  onClick={removeImage}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-4 text-center ${isEspresso ? 'border-[#FB923C]/30' : 'border-gray-300'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer text-sm ${isEspresso ? 'text-[#FAFAFA]/70 hover:text-[#FAFAFA]' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Click to upload image (QR code, logo, etc.)
                </label>
              </div>
            )}
          </div>
        )}

        {/* Options for select, radio, checkbox */}
        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${subTextClass}`}>
              Options
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${isEspresso
                        ? 'bg-white/5 border-[#FB923C]/30 text-[#FAFAFA] focus:ring-[#FB923C]'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className={`flex items-center text-sm ${isEspresso ? 'text-[#FB923C] hover:text-[#FCD34D]' : 'text-blue-600 hover:text-blue-800'}`}
              >
                <Plus size={16} className="mr-1" />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div className={`border-t pt-4 ${isEspresso ? 'border-[#FB923C]/20' : 'border-gray-200'}`}>
          <h4 className={`text-sm font-medium mb-2 ${subTextClass}`}>Validation Rules</h4>
          <div className="grid grid-cols-2 gap-4">
            {field.type === 'number' && (
              <>
                <div>
                  <label className={`block text-xs mb-1 ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-600'}`}>Min Value</label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateField({
                      validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 ${isEspresso
                        ? 'bg-white/5 border-[#FB923C]/30 text-[#FAFAFA] focus:ring-[#FB923C]'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    placeholder="Min value"
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-600'}`}>Max Value</label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateField({
                      validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 ${isEspresso
                        ? 'bg-white/5 border-[#FB923C]/30 text-[#FAFAFA] focus:ring-[#FB923C]'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    placeholder="Max value"
                  />
                </div>
              </>
            )}
            {(field.type === 'text' || field.type === 'textarea') && (
              <>
                <div>
                  <label className={`block text-xs mb-1 ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-600'}`}>Min Length</label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => updateField({
                      validation: { ...field.validation, minLength: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 ${isEspresso
                        ? 'bg-white/5 border-[#FB923C]/30 text-[#FAFAFA] focus:ring-[#FB923C]'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    placeholder="Min length"
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isEspresso ? 'text-[#FAFAFA]/50' : 'text-gray-600'}`}>Max Length</label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => updateField({
                      validation: { ...field.validation, maxLength: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 ${isEspresso
                        ? 'bg-white/5 border-[#FB923C]/30 text-[#FAFAFA] focus:ring-[#FB923C]'
                        : 'border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    placeholder="Max length"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
