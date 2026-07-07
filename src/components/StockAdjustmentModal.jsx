import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StockAdjustmentModal = ({
  isOpen,
  onClose,
  product,
  onSubmit
}) => {
  const [adjustmentType, setAdjustmentType] = useState('restock'); // 'restock' or 'sale'

  useEffect(() => {
    if (isOpen) {
      setAdjustmentType('restock');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Validation Schema depends on the adjustment type (must not exceed current stock for sales)
  const validationSchema = Yup.object().shape({
    quantity: Yup.number()
      .typeError('Quantity must be a number')
      .integer('Quantity must be an integer')
      .positive('Quantity must be greater than zero')
      .required('Quantity is required')
      .test(
        'max-stock',
        `Cannot sell more than current stock of ${product.stock}`,
        function (value) {
          if (adjustmentType === 'sale' && value > product.stock) {
            return false;
          }
          return true;
        }
      ),
    notes: Yup.string().max(100, 'Notes must be 100 characters or less')
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Stock Adjustment</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingBottom: '0.5rem' }}>
          {/* Product Info Summary */}
          <div style={{
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{product.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>SKU: <b>{product.sku}</b></span>
              <span>Current Stock: <b style={{ color: product.stock === 0 ? 'var(--danger-color)' : product.stock <= 5 ? 'var(--warning-color)' : 'var(--success-color)' }}>{product.stock} units</b></span>
            </div>
          </div>

          {/* Toggle Type */}
          <label className="form-label">Adjustment Type</label>
          <div className="adjustment-type-toggle">
            <button
              type="button"
              className={`adjustment-type-btn ${adjustmentType === 'restock' ? 'active restock' : ''}`}
              onClick={() => setAdjustmentType('restock')}
            >
              <ArrowUpRight size={16} /> Restock (Incoming)
            </button>
            <button
              type="button"
              className={`adjustment-type-btn ${adjustmentType === 'sale' ? 'active sale' : ''}`}
              onClick={() => setAdjustmentType('sale')}
              disabled={product.stock === 0}
              style={product.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <ArrowDownRight size={16} /> Sale (Outgoing)
            </button>
          </div>

          <Formik
            initialValues={{
              quantity: '',
              notes: ''
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              onSubmit(product.sku, adjustmentType, values.quantity, values.notes.trim());
              resetForm();
              onClose();
            }}
          >
            {({ errors, touched, values }) => (
              <Form>
                {/* Quantity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">
                    Quantity to {adjustmentType === 'restock' ? 'Add' : 'Deduct'}
                  </label>
                  <Field
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="Enter quantity"
                    className={`form-input ${touched.quantity && errors.quantity ? 'error' : ''}`}
                  />
                  <ErrorMessage name="quantity" component="span" className="input-error-msg" />
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    Notes / Remarks (Optional)
                  </label>
                  <Field
                    as="textarea"
                    id="notes"
                    name="notes"
                    placeholder={adjustmentType === 'restock' ? 'e.g. Received shipment from supplier' : 'e.g. Customer checkout'}
                    className={`form-input ${touched.notes && errors.notes ? 'error' : ''}`}
                    style={{ minHeight: '80px', resize: 'vertical', padding: '0.5rem 0.75rem' }}
                  />
                  <ErrorMessage name="notes" component="span" className="input-error-msg" />
                </div>

                <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem -1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${adjustmentType === 'restock' ? 'btn-success' : 'btn-danger'}`}
                  >
                    Confirm {adjustmentType === 'restock' ? 'Restock' : 'Sale'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
