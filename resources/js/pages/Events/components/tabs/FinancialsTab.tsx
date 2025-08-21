import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CreateEventFormData } from '@/schemas';

interface FinancialsTabProps {
  register: UseFormRegister<CreateEventFormData>;
  errors: FieldErrors<CreateEventFormData>;
  addOns: Array<{ name: string; price: number; quantity: number; total_price: number }>;
  watchedPackagePrice?: number;
  watchedDepositValue?: number;
  addAddOn: () => void;
  updateAddOn: (
    index: number,
    field: keyof { name: string; price: number; quantity: number; total_price: number },
    value: string | number
  ) => void;
  removeAddOn: (index: number) => void;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({
  register,
  errors,
  addOns,
  watchedPackagePrice,
  watchedDepositValue,
  addAddOn,
  updateAddOn,
  removeAddOn,
}) => {
  return (
    <div className="space-y-6">
      {/* Package and Add-ons */}
      <div>
        <h3 className="text-lg font-semibold text-secondary mb-4">Package & Add-ons</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Package Price *</label>
            <input
              type="number"
              step="0.01"
              {...register('package', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors.package ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.package && (
              <p className="text-red-600 text-sm mt-1">{errors.package.message}</p>
            )}
          </div>

          {/* Add-ons */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-secondary">Add-ons</label>
              <button
                type="button"
                onClick={addAddOn}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Item
              </button>
            </div>

            {addOns.length > 0 && (
              <>
                {/* Column Headers */}
                <div className="grid grid-cols-5 gap-2 mb-2 pb-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-700">Name</div>
                  <div className="text-sm font-medium text-gray-700 text-center">Price</div>
                  <div className="text-sm font-medium text-gray-700 text-center">Quantity</div>
                  <div className="text-sm font-medium text-gray-700 text-center">Total</div>
                  <div className="text-sm font-medium text-gray-700 text-center">Action</div>
                </div>

                {/* Add-on Items */}
                {addOns.map((addon, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-center mb-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={addon.name}
                        onChange={e => updateAddOn(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={addon.price}
                        onChange={e => updateAddOn(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="1"
                        value={addon.quantity}
                        onChange={e =>
                          updateAddOn(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={addon.total_price.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-center"
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeAddOn(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deposit */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Deposit</h4>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Deposit Value *</label>
          <input
            type="number"
            step="0.01"
            {...register('deposit_value', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
              errors.deposit_value ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.deposit_value && (
            <p className="text-red-600 text-sm mt-1">{errors.deposit_value.message}</p>
          )}
        </div>
      </div>

      {/* Fee Summary */}
      <div>
        <h4 className="text-md font-semibold text-secondary mb-4">Fee Summary</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Package Price:</span>
            <span>${(watchedPackagePrice || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Add-ons Total:</span>
            <span>${addOns.reduce((sum, addon) => sum + addon.total_price, 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total:</span>
            <span>
              $
              {(
                (watchedPackagePrice || 0) +
                addOns.reduce((sum, addon) => sum + addon.total_price, 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Deposit:</span>
            <span>${(watchedDepositValue || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Balance Due:</span>
            <span>
              $
              {(
                (watchedPackagePrice || 0) +
                addOns.reduce((sum, addon) => sum + addon.total_price, 0) -
                (watchedDepositValue || 0)
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsTab;
