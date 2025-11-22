import { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Template, ProductType } from '../../../lib/api';

interface ProductSpecificCustomDataStepProps {
  selectedProductType: ProductType | null;
  selectedTemplate: Template | null;
  customData: Record<string, unknown>;
  onCustomDataChange: (data: Record<string, unknown>) => void;
}

interface FormField {
  key: string;
  schema: unknown;
  value: unknown;
  error?: string;
  visible: boolean;
}

export function ProductSpecificCustomDataStep({
  selectedProductType,
  selectedTemplate,
  customData,
  onCustomDataChange
}: ProductSpecificCustomDataStepProps) {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!selectedTemplate?.default_custom_data_schema) {
      setFormFields([]);
      setIsValid(true);
      return;
    }

    // Parse the JSON schema and create form fields
    const schema = selectedTemplate.default_custom_data_schema;
    const fields: FormField[] = [];

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, fieldSchema]: [string, any]) => {
        fields.push({
          key,
          schema: fieldSchema,
          value: customData[key] || getDefaultValue(fieldSchema),
          error: undefined,
          visible: true, // Will be updated by conditional logic
        });
      });
    }

    setFormFields(fields);
    updateFieldVisibility(fields);
    validateForm(fields);
  }, [selectedTemplate, customData]);

  // Update field visibility when form data changes
  useEffect(() => {
    if (formFields.length > 0) {
      updateFieldVisibility(formFields);
    }
  }, [customData]);

  const getDefaultValue = (schema: any): any => {
    if (schema.default !== undefined) return schema.default;
    if (schema.type === 'string') return '';
    if (schema.type === 'number') return 0;
    if (schema.type === 'boolean') return false;
    if (schema.type === 'array') return [];
    if (schema.type === 'object') return {};
    return null;
  };

  const validateForm = (fields: FormField[]) => {
    let valid = true;
    const updatedFields = fields.map(field => {
      const error = validateField(field.key, field.value, field.schema);
      if (error) valid = false;
      return { ...field, error };
    });

    setFormFields(updatedFields);
    setIsValid(valid);
  };

  const updateFieldVisibility = (fields: FormField[]) => {
    const updatedFields = fields.map(field => {
      const visible = evaluateFieldVisibility(field.key, field.schema, customData);
      return { ...field, visible };
    });

    setFormFields(updatedFields);
  };

  const evaluateFieldVisibility = (fieldKey: string, schema: any, formData: Record<string, unknown>): boolean => {
    // Check if/then/else conditional logic
    if (schema.if) {
      const condition = schema.if;
      const conditionMet = evaluateCondition(condition, formData);

      if (conditionMet && schema.then) {
        // Field should be visible based on 'then' clause
        return true;
      } else if (!conditionMet && schema.else) {
        // Field should be hidden based on 'else' clause
        return false;
      }
    }

    // Check dependencies (simpler conditional logic)
    if (schema.dependencies) {
      for (const [depField, depValue] of Object.entries(schema.dependencies)) {
        const currentValue = formData[depField];
        if (Array.isArray(depValue)) {
          if (!depValue.includes(currentValue)) {
            return false;
          }
        } else if (currentValue !== depValue) {
          return false;
        }
      }
    }

    // Default to visible
    return true;
  };

  const evaluateCondition = (condition: any, formData: Record<string, unknown>): boolean => {
    // Simple condition evaluation - can be extended for more complex logic
    if (condition.properties) {
      for (const [prop, expectedValue] of Object.entries(condition.properties)) {
        if (formData[prop] !== expectedValue) {
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const validateField = (key: string, value: any, schema: any): string | undefined => {
    // Required field validation
    if (schema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${key} is required`;
    }

    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      return `${key} must be a string`;
    }

    if (schema.type === 'number' && typeof value !== 'number') {
      return `${key} must be a number`;
    }

    if (schema.type === 'boolean' && typeof value !== 'boolean') {
      return `${key} must be a boolean`;
    }

    // String constraints
    if (schema.type === 'string' && schema.minLength && value.length < schema.minLength) {
      return `${key} must be at least ${schema.minLength} characters`;
    }

    if (schema.type === 'string' && schema.maxLength && value.length > schema.maxLength) {
      return `${key} must be no more than ${schema.maxLength} characters`;
    }

    // Number constraints
    if (schema.type === 'number' && schema.minimum !== undefined && value < schema.minimum) {
      return `${key} must be at least ${schema.minimum}`;
    }

    if (schema.type === 'number' && schema.maximum !== undefined && value > schema.maximum) {
      return `${key} must be no more than ${schema.maximum}`;
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      return `${key} must be one of: ${schema.enum.join(', ')}`;
    }

    return undefined;
  };

  const handleFieldChange = (key: string, value: any) => {
    const updatedData = { ...customData, [key]: value };
    onCustomDataChange(updatedData);
  };

  const handleFileUpload = (key: string, file: File) => {
    // For now, just store the file. In a real implementation, you'd upload to a server
    handleFieldChange(key, file);
  };

  const removeFile = (key: string) => {
    handleFieldChange(key, null);
  };

  const renderField = (field: FormField) => {
    const { key, schema, value, error } = field;

    // File upload field
    if (schema.format === 'file' || schema.type === 'file') {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {schema.title || key}
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {value ? (
            <div className="relative">
              <div className="flex items-center p-3 border border-gray-300 rounded-md bg-gray-50">
                <Upload className="w-5 h-5 text-gray-400 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{value.name}</p>
                  <p className="text-xs text-gray-500">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(key)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-2">Click to upload a file</p>
              <p className="text-sm text-gray-400">
                {schema.accept ? `Accepted: ${schema.accept}` : 'Any file type'}
              </p>
              <input
                type="file"
                accept={schema.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(key, file);
                }}
                className="hidden"
                id={`file-input-${key}`}
              />
              <label
                htmlFor={`file-input-${key}`}
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          )}

          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Select field
    if (schema.enum) {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {schema.title || key}
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {schema.enum.map((option: any) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Textarea for long text
    if (schema.type === 'string' && (schema.maxLength > 100 || schema.format === 'textarea')) {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {schema.title || key}
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            rows={4}
            maxLength={schema.maxLength}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={schema.description || `Enter ${key}`}
          />
          {schema.maxLength && (
            <p className="mt-1 text-xs text-gray-500">
              {value?.length || 0}/{schema.maxLength} characters
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Number input
    if (schema.type === 'number') {
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {schema.title || key}
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
            min={schema.minimum}
            max={schema.maximum}
            step={schema.multipleOf || 1}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={schema.description || `Enter ${key}`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Boolean checkbox
    if (schema.type === 'boolean') {
      return (
        <div key={key} className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleFieldChange(key, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            {schema.title || key}
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      );
    }

    // Default text input
    return (
      <div key={key}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {schema.title || key}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          maxLength={schema.maxLength}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={schema.description || `Enter ${key}`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  if (!selectedProductType || !selectedTemplate) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Content</h2>
          <p className="text-gray-600">Please select a product type and template first.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <p className="text-yellow-800">Select a product type and template to customize your content.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Content</h2>
        <p className="text-gray-600">
          Fill in the details for your {selectedProductType.name.toLowerCase()} using the {selectedTemplate.name} template.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Template:</strong> {selectedTemplate.name} - {selectedTemplate.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-6">
          {formFields.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customization needed</h3>
              <p className="text-gray-600">
                This template doesn't require additional custom data. You can proceed to the next step.
              </p>
            </div>
          ) : (
             formFields.filter(field => field.visible).map(renderField)
          )}
        </div>
      </div>

      {/* Validation Summary */}
      {formFields.length > 0 && (
        <div className={`rounded-lg border p-4 ${
          isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            )}
            <p className={`text-sm ${
              isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {isValid ? 'All fields are valid. Ready to proceed!' : 'Please fix the errors above before continuing.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}