import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Trash2,
  Download,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Plus,
  RefreshCw,
  Edit,
  SlidersHorizontal,
  PackageOpen
} from 'lucide-react';

export const ProductList = ({
  products = [],
  categories = [],
  onEditProduct,
  onDeleteProduct,
  onDeleteMultiple,
  onAdjustStock,
  onBulkRestock,
  onExportCSV
}) => {
  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Layout View mode
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Selection for bulk actions
  const [selectedSkus, setSelectedSkus] = useState([]);

  // Bulk restock dialog state
  const [showBulkRestock, setShowBulkRestock] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkError, setBulkError] = useState('');

  // Handle individual checkbox change
  const handleSelectSku = (sku) => {
    setSelectedSkus((prev) =>
      prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]
    );
  };

  // Filtered & Sorted products list
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        const matchSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchCategory =
          categoryFilter === 'All' || p.category === categoryFilter;

        // Stock status filter
        let matchStock = true;
        if (stockFilter === 'InStock') {
          matchStock = p.stock > 0;
        } else if (stockFilter === 'LowStock') {
          matchStock = p.stock > 0 && p.stock <= 5;
        } else if (stockFilter === 'OutOfStock') {
          matchStock = p.stock === 0;
        }

        return matchSearch && matchCategory && matchStock;
      })
      .sort((a, b) => {
        // Sorting logic
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Case insensitive sorting for strings
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  // Handle select all toggle
  const isAllSelected = useMemo(() => {
    if (processedProducts.length === 0) return false;
    return processedProducts.every((p) => selectedSkus.includes(p.sku));
  }, [processedProducts, selectedSkus]);

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      // Remove all currently shown items from selection
      const skuSet = new Set(processedProducts.map((p) => p.sku));
      setSelectedSkus((prev) => prev.filter((sku) => !skuSet.has(sku)));
    } else {
      // Add all currently shown items to selection
      const newSkus = processedProducts.map((p) => p.sku);
      setSelectedSkus((prev) => [...new Set([...prev, ...newSkus])]);
    }
  };

  // Toggle sort order or field
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Render sorting arrows
  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: 0.5 }} />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={14} style={{ marginLeft: '4px', color: 'var(--primary-color)' }} />
    ) : (
      <ChevronDown size={14} style={{ marginLeft: '4px', color: 'var(--primary-color)' }} />
    );
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSkus.length} selected products?`)) {
      onDeleteMultiple(selectedSkus);
      setSelectedSkus([]);
    }
  };

  // Handle bulk restock submit
  const handleBulkRestockSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(bulkQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setBulkError('Please enter a valid positive quantity');
      return;
    }

    onBulkRestock(selectedSkus, qty, bulkNotes.trim());
    setBulkQty('');
    setBulkNotes('');
    setBulkError('');
    setShowBulkRestock(false);
    setSelectedSkus([]);
  };

  // Get status badge UI
  const getStatusBadge = (stock) => {
    if (stock === 0) {
      return <span className="badge badge-outofstock">Out of Stock</span>;
    }
    if (stock <= 5) {
      return <span className="badge badge-lowstock">Low Stock ({stock})</span>;
    }
    return <span className="badge badge-instock">In Stock</span>;
  };

  return (
    <div>
      {/* Controls Strip (Search, Category Filter, Stock Filter, Export) */}
      <div className="filter-bar">
        <div className="filter-main">
          {/* Realtime Search */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* CSV Export */}
          <button className="btn btn-secondary" onClick={onExportCSV} title="Export Inventory to CSV">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="filter-options">
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="select-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stock:</span>
            <select
              className="select-input"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="All">All Stock Levels</option>
              <option value="InStock">In Stock Only</option>
              <option value="LowStock">Low Stock (≤ 5)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>
          </div>

          {/* View Toggles */}
          <div style={{ marginLeft: 'auto' }} className="view-toggles">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedSkus.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            Selected <b>{selectedSkus.length}</b> products for batch actions
          </div>
          <div className="bulk-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => setShowBulkRestock(true)}
              style={{ color: 'var(--success-color)', border: '1px solid var(--success-color)' }}
            >
              <RefreshCw size={14} /> Bulk Restock
            </button>
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              <Trash2 size={14} /> Bulk Delete
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedSkus([])}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Product views */}
      {processedProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <PackageOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search terms or filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th style={{ width: '40px', cursor: 'default' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                  />
                </th>
                <th onClick={() => handleSort('sku')}>Product ID {renderSortIndicator('sku')}</th>
                <th onClick={() => handleSort('name')}>Name {renderSortIndicator('name')}</th>
                <th onClick={() => handleSort('category')}>Category {renderSortIndicator('category')}</th>
                <th onClick={() => handleSort('price')} style={{ textAlign: 'right' }}>Price (LKR) {renderSortIndicator('price')}</th>
                <th onClick={() => handleSort('stock')} style={{ textAlign: 'right' }}>Stock {renderSortIndicator('stock')}</th>
                <th style={{ cursor: 'default' }}>Status</th>
                <th style={{ width: '180px', cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedProducts.map((p) => {
                const isSelected = selectedSkus.includes(p.sku);
                return (
                  <tr key={p.sku} style={isSelected ? { backgroundColor: 'var(--primary-light)' } : {}}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectSku(p.sku)}
                      />
                    </td>
                    <td className="sku-cell">{p.sku}</td>
                    <td className="product-name-cell">{p.name}</td>
                    <td>
                      <span className="badge badge-category">{p.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>Rs. {p.price.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.stock}</td>
                    <td>{getStatusBadge(p.stock)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => onAdjustStock(p)}
                        >
                          Adjust Stock
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => onEditProduct(p)}
                          title="Edit Product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px', color: 'var(--danger-color)' }}
                          onClick={() => {
                            if (window.confirm(`Delete product ${p.name}?`)) {
                              onDeleteProduct(p.sku);
                            }
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="product-grid">
          {processedProducts.map((p) => {
            const isSelected = selectedSkus.includes(p.sku);
            return (
              <div
                key={p.sku}
                className="product-card"
                style={isSelected ? { borderColor: 'var(--primary-color)', background: 'var(--primary-light)' } : {}}
              >
                <input
                  type="checkbox"
                  className="product-card-checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectSku(p.sku)}
                />
                <div className="product-card-header">
                  <div className="product-card-sku">{p.sku}</div>
                  <h3 className="product-card-title" title={p.name}>{p.name}</h3>
                </div>
                <div className="product-card-body">
                  <div className="product-card-row">
                    <span className="product-card-label">Category:</span>
                    <span className="badge badge-category">{p.category}</span>
                  </div>
                  <div className="product-card-row">
                    <span className="product-card-label">Price:</span>
                    <span className="product-card-value price">Rs. {p.price.toFixed(2)}</span>
                  </div>
                  <div className="product-card-row" style={{ alignItems: 'center' }}>
                    <span className="product-card-label">Stock level:</span>
                    <span className="product-card-value">{p.stock} units</span>
                  </div>
                  <div className="product-card-row" style={{ marginTop: '0.25rem' }}>
                    <span className="product-card-label">Status:</span>
                    {getStatusBadge(p.stock)}
                  </div>
                </div>
                <div className="product-card-actions">
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => onAdjustStock(p)}
                  >
                    Adjust Stock
                  </button>
                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={() => onEditProduct(p)}
                    title="Edit Product"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ color: 'var(--danger-color)' }}
                    onClick={() => {
                      if (window.confirm(`Delete product ${p.name}?`)) {
                        onDeleteProduct(p.sku);
                      }
                    }}
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Restock Quantity Input Dialog Modal */}
      {showBulkRestock && (
        <div className="modal-overlay" onClick={() => setShowBulkRestock(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Bulk Restock ({selectedSkus.length} Items)</h3>
              <button className="close-btn" onClick={() => setShowBulkRestock(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleBulkRestockSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="bulkQty">
                    Restock Quantity (Add to each)
                  </label>
                  <input
                    type="number"
                    id="bulkQty"
                    className={`form-input ${bulkError ? 'error' : ''}`}
                    value={bulkQty}
                    onChange={(e) => {
                      setBulkQty(e.target.value);
                      if (bulkError) setBulkError('');
                    }}
                    placeholder="Enter quantity to add"
                  />
                  {bulkError && <span className="input-error-msg">{bulkError}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bulkNotes">
                    Notes / Remarks
                  </label>
                  <input
                    type="text"
                    id="bulkNotes"
                    className="form-input"
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                    placeholder="e.g. Received container shipment"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBulkRestock(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
