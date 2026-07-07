import React, { useState, useEffect } from 'react';
import {
  Package,
  BadgeDollarSign,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Moon,
  Sun,
  History,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { useToast } from './components/ToastContext';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { CategoryDistribution, StockLevels } from './components/AnalyticsCharts';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_CATEGORIES,
  DEFAULT_HISTORY,
  exportToCSV
} from './utils/inventoryHelpers';

function App() {
  const { addToast } = useToast();

  // Load state from localStorage or defaults
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('inv_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('inv_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('inv_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('inv_theme');
    return saved || 'light';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('inv_sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Modal open/close controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding
  
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('inv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inv_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('inv_sidebar_open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('inv_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Add category handler
  const handleAddCategory = (newCatName) => {
    setCategories(prev => [...prev, newCatName]);
    addToast('Success', `Category "${newCatName}" created successfully!`, 'success');
  };

  // Add / Edit Product Submit
  const handleProductSubmit = (values) => {
    const isEdit = products.some(p => p.sku === values.sku);
    
    // Convert form string types to numbers
    const cleanProduct = {
      sku: values.sku,
      name: values.name.trim(),
      category: values.category,
      price: parseFloat(values.price),
      stock: parseInt(values.stock, 10)
    };

    if (isEdit) {
      // Record edit log in history if stock levels changed
      const oldProd = products.find(p => p.sku === values.sku);
      if (oldProd && oldProd.stock !== cleanProduct.stock) {
        const diff = cleanProduct.stock - oldProd.stock;
        const type = diff > 0 ? 'restock' : 'sale';
        const absDiff = Math.abs(diff);
        
        const historyEntry = {
          id: `hist-${Math.random().toString(36).substring(2, 9)}`,
          sku: cleanProduct.sku,
          name: cleanProduct.name,
          type,
          quantity: absDiff,
          timestamp: new Date().toISOString(),
          notes: `Stock quantity updated during product edit (from ${oldProd.stock} to ${cleanProduct.stock})`
        };
        setHistory(prev => [historyEntry, ...prev]);
      }

      setProducts(prev => prev.map(p => p.sku === values.sku ? cleanProduct : p));
      addToast('Product Updated', `Successfully updated product "${cleanProduct.name}"`, 'success');
    } else {
      setProducts(prev => [...prev, cleanProduct]);
      
      // Also log the initial stock adding
      if (cleanProduct.stock > 0) {
        const historyEntry = {
          id: `hist-${Math.random().toString(36).substring(2, 9)}`,
          sku: cleanProduct.sku,
          name: cleanProduct.name,
          type: 'restock',
          quantity: cleanProduct.stock,
          timestamp: new Date().toISOString(),
          notes: 'Product created with initial stock level'
        };
        setHistory(prev => [historyEntry, ...prev]);
      }

      addToast('Product Added', `Successfully created product "${cleanProduct.name}"`, 'success');
    }
  };

  // Delete product handler
  const handleDeleteProduct = (sku) => {
    const productToDelete = products.find(p => p.sku === sku);
    if (!productToDelete) return;

    setProducts(prev => prev.filter(p => p.sku !== sku));
    addToast('Product Deleted', `Removed "${productToDelete.name}" from inventory`, 'danger');
  };

  // Delete multiple products (Bulk action)
  const handleDeleteMultiple = (skus) => {
    setProducts(prev => prev.filter(p => !skus.includes(p.sku)));
    addToast('Bulk Deletion', `Removed ${skus.length} products from inventory`, 'danger');
  };

  // Stock quick adjustment submit
  const handleStockAdjustmentSubmit = (sku, type, quantity, notes) => {
    setProducts(prev => prev.map(p => {
      if (p.sku === sku) {
        const newStock = type === 'restock' ? p.stock + quantity : p.stock - quantity;
        
        // Log history entry
        const historyEntry = {
          id: `hist-${Math.random().toString(36).substring(2, 9)}`,
          sku: p.sku,
          name: p.name,
          type,
          quantity,
          timestamp: new Date().toISOString(),
          notes: notes || (type === 'restock' ? 'Manual stock adjustment' : 'Product sale')
        };
        
        setHistory(prevHist => [historyEntry, ...prevHist]);
        return { ...p, stock: newStock };
      }
      return p;
    }));

    const prod = products.find(p => p.sku === sku);
    const prodName = prod ? prod.name : sku;
    addToast(
      'Stock Adjusted',
      `Updated "${prodName}" stock level (${type === 'restock' ? '+' : '-'}${quantity} units)`,
      type === 'restock' ? 'success' : 'warning'
    );
  };

  // Bulk restock submit
  const handleBulkRestockSubmit = (skus, quantity, notes) => {
    const timestamp = new Date().toISOString();
    const newLogs = [];

    setProducts(prev => prev.map(p => {
      if (skus.includes(p.sku)) {
        newLogs.push({
          id: `hist-${Math.random().toString(36).substring(2, 9)}`,
          sku: p.sku,
          name: p.name,
          type: 'restock',
          quantity,
          timestamp,
          notes: notes || 'Bulk restock adjustment'
        });
        return { ...p, stock: p.stock + quantity };
      }
      return p;
    }));

    setHistory(prevHist => [...newLogs, ...prevHist]);
    addToast('Bulk Restock', `Restocked ${skus.length} items by +${quantity} units each`, 'success');
  };

  // Delete single history log entry
  const handleDeleteHistoryItem = (id) => {
    if (window.confirm('Are you sure you want to delete this activity log entry?')) {
      setHistory(prev => prev.filter(log => log.id !== id));
      addToast('Log Deleted', 'Activity log entry removed', 'danger');
    }
  };

  // Clear all history logs
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear the entire stock activity log? This cannot be undone.')) {
      setHistory([]);
      addToast('History Cleared', 'All activity logs have been removed', 'danger');
    }
  };

  // Calculate Dashboard Stats
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    
    return {
      totalProducts,
      totalValue,
      outOfStockCount,
      lowStockCount
    };
  }, [products]);

  // Open modal helpers
  const triggerAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const triggerEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const triggerAdjustStock = (product) => {
    setAdjustingProduct(product);
    setIsAdjustOpen(true);
  };

  const triggerCSVExport = () => {
    exportToCSV(products);
    addToast('Export Complete', 'Inventory downloaded as CSV file', 'success');
  };

  return (
    <div className="app-container">
      {/* Main dashboard content */}
      <main className="main-content">
        
        {/* Top Header section */}
        <header className="app-header">
          <div className="header-title">
            <h1>Amry's Inventory</h1>
            <p>Complete dashboard tracking products, stock levels, and category analytics</p>
          </div>
          <div className="header-actions">
            {/* Toggle Activity Log Sidebar */}
            <button
              className={`btn btn-secondary btn-icon ${isSidebarOpen ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Hide Activity Log' : 'Show Activity Log'}
            >
              <History size={18} />
            </button>
            {/* Theme Toggle Button */}
            <button
              className="btn btn-secondary btn-icon"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {/* Add Product Button */}
            <button className="btn btn-primary" onClick={triggerAddProduct}>
              <PlusCircle size={18} /> Add Product
            </button>
          </div>
        </header>

        {/* Dashboard Metrics Widgets */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrapper primary">
              <Package size={24} />
            </div>
            <div className="metric-info">
              <h3>Total Products</h3>
              <div className="metric-value">{stats.totalProducts}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper success">
              <BadgeDollarSign size={24} />
            </div>
            <div className="metric-info">
              <h3>Inventory Value</h3>
              <div className="metric-value">Rs. {stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper warning">
              <TrendingUp size={24} />
            </div>
            <div className="metric-info">
              <h3>Low Stock Items</h3>
              <div className="metric-value" style={stats.lowStockCount > 0 ? { color: 'var(--warning-color)' } : {}}>{stats.lowStockCount}</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrapper danger">
              <AlertTriangle size={24} />
            </div>
            <div className="metric-info">
              <h3>Out of Stock</h3>
              <div className="metric-value" style={stats.outOfStockCount > 0 ? { color: 'var(--danger-color)' } : {}}>{stats.outOfStockCount}</div>
            </div>
          </div>
        </section>

        {/* Analytics Charts section */}
        <section className="analytics-grid">
          <div className="analytics-card">
            <h2>Category Distribution</h2>
            <div className="chart-container">
              <CategoryDistribution products={products} />
            </div>
          </div>
          <div className="analytics-card">
            <h2>Stock Level Analysis</h2>
            <div className="chart-container">
              <StockLevels products={products} />
            </div>
          </div>
        </section>

        {/* Product Inventory Table View */}
        <section style={{ marginBottom: '2.5rem' }}>
          <ProductList
            products={products}
            categories={categories}
            onEditProduct={triggerEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onDeleteMultiple={handleDeleteMultiple}
            onAdjustStock={triggerAdjustStock}
            onBulkRestock={handleBulkRestockSubmit}
            onExportCSV={triggerCSVExport}
          />
        </section>
      </main>

      {/* Stock History Log timeline panel (collapsible right sidebar style) */}
      <aside className={`log-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} /> Stock Activity Log
          </h2>
          {history.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleClearAllHistory}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger-color)', border: '1px solid var(--danger-light)', background: 'transparent' }}
            >
              Clear All
            </button>
          )}
        </div>
        <div style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
              No inventory activity logged yet.
            </div>
          ) : (
            <div className="timeline">
              {history.slice(0, 20).map((log) => (
                <div key={log.id} className="timeline-item" style={{ position: 'relative' }}>
                  <div className={`timeline-dot ${log.type}`} />
                  <div className="timeline-header" style={{ paddingRight: '22px' }}>
                    <span className="timeline-title">
                      {log.type === 'restock' ? 'Restocked' : 'Sold'} {log.quantity}x
                    </span>
                    <span className="timeline-time">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="timeline-body" style={{ paddingRight: '20px' }}>
                    <b>{log.name}</b> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>({log.sku})</span>
                    {log.notes && <div className="timeline-notes">"{log.notes}"</div>}
                  </div>
                  <button
                    className="delete-log-btn"
                    onClick={() => handleDeleteHistoryItem(log.id)}
                    title="Delete log entry"
                    style={{
                      position: 'absolute',
                      right: '0',
                      top: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      opacity: '0',
                      transition: 'opacity 0.2s ease, color 0.2s ease'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        onSubmit={handleProductSubmit}
        categories={categories}
        onAddCategory={handleAddCategory}
        products={products}
      />

      <StockAdjustmentModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        product={adjustingProduct}
        onSubmit={handleStockAdjustmentSubmit}
      />
    </div>
  );
}

export default App;
