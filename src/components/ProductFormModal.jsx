import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Plus, FolderPlus } from 'lucide-react';
import { generateSKU } from '../utils/inventoryHelpers';

export const ProductFormModal = ({
  isOpen,
  onClose,
  product, // null if adding, product object if editing
  onSubmit,
  categories,
  onAddCategory,
  products = []
}) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catError, setCatError] = useState('');

  // Initial values setup
  const [initialValues, setInitialValues] = useState({
    sku: '',
    name: '',
    category: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setInitialValues({
          sku: product.sku,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock
        });
      } else {
        // Generate a temporary SKU for the form preview
        const tempSku = generateSKU(products);
        setInitialValues({
          sku: tempSku,
          name: '',
          category: categories[0] || '',
          price: '',
          stock: '0'
        });
      }
      setShowAddCategory(false);
      setNewCategoryName('');
      setCatError('');
    }
  }, [isOpen, product, categories, products]);

  if (!isOpen) return null;

  // Validation Schema
  const validationSchema = Yup.object().shape({
    sku: Yup.string().required('Product SKU is required'),
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .required('Product Name is required'),
    category: Yup.string().required('Please select a category'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be greater than zero')
      .required('Price is required'),
    stock: Yup.number()
      .typeError('Stock must be a number')
      .integer('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .required('Stock quantity is required')
  });

  const handleCreateCategory = (e, setFieldValue) => {
    e.preventDefault();
    const cleanCatName = newCategoryName.trim();
    
    if (!cleanCatName) {
      setCatError('Category name cannot be empty');
      return;
    }

    if (categories.some(cat => cat.toLowerCase() === cleanCatName.toLowerCase())) {
      setCatError('Category already exists');
      return;
    }

    onAddCategory(cleanCatName);
    setFieldValue('category', cleanCatName);
    setNewCategoryName('');
    setShowAddCategory(false);
    setCatError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values);
            resetForm();
            onClose();
          }}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <div className="modal-body">
                {/* SKU (Read Only) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="sku">
                    Product ID / SKU (Auto-generated)
                  </label>
                  <Field
                    type="text"
                    id="sku"
                    name="sku"
                    className="form-input sku-cell"
                    readOnly
                    style={{ backgroundColor: 'var(--bg-color)', opacity: 0.8, cursor: 'not-allowed' }}
                  />
                  <ErrorMessage name="sku" component="span" className="input-error-msg" />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Product Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Sony Wireless Headphones"
                    className={`form-input ${touched.name && errors.name ? 'error' : ''}`}
                  />
                  <ErrorMessage name="name" component="span" className="input-error-msg" />
                </div>

                {/* Category */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="category">
                      Category
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '2px', borderStyle: 'dashed' }}
                      onClick={() => setShowAddCategory(!showAddCategory)}
                    >
                      <Plus size={12} /> Custom Category
                    </button>
                  </div>
                  
                  {!showAddCategory ? (
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className={`select-input ${touched.category && errors.category ? 'error' : ''}`}
                      style={{ width: '100%', marginTop: '0.25rem' }}
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Field>
                  ) : (
                    <div className="add-cat-inline">
                      <div className="form-inline-action">
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            placeholder="New Category Name"
                            className={`form-input ${catError ? 'error' : ''}`}
                            value={newCategoryName}
                            onChange={(e) => {
                              setNewCategoryName(e.target.value);
                              if (catError) setCatError('');
                            }}
                          />
                          {catError && <span className="input-error-msg">{catError}</span>}
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={(e) => handleCreateCategory(e, setFieldValue)}
                          style={{ padding: '0.65rem 1rem' }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowAddCategory(false);
                            setCatError('');
                          }}
                          style={{ padding: '0.65rem 1rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <ErrorMessage name="category" component="span" className="input-error-msg" />
                </div>

                {/* Price and Stock Row */}
                <div className="form-group row">
                  <div>
                    <label className="form-label" htmlFor="price">
                      Price (LKR)
                    </label>
                    <Field
                      type="text"
                      id="price"
                      name="price"
                      placeholder="0.00"
                      className={`form-input ${touched.price && errors.price ? 'error' : ''}`}
                    />
                    <ErrorMessage name="price" component="span" className="input-error-msg" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="stock">
                      Stock Quantity
                    </label>
                    <Field
                      type="number"
                      id="stock"
                      name="stock"
                      placeholder="0"
                      className={`form-input ${touched.stock && errors.stock ? 'error' : ''}`}
                    />
                    <ErrorMessage name="stock" component="span" className="input-error-msg" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {product ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
