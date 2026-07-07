// Inventory Management System Helpers

// Generate a random SKU format: PRD-XXXXXX (6 random digits)
export const generateSKU = (existingProducts = []) => {
  const existingSkus = new Set(existingProducts.map(p => p.sku));
  let isUnique = false;
  let sku = '';
  
  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
    sku = `PRD-${randomDigits}`;
    if (!existingSkus.has(sku)) {
      isUnique = true;
    }
  }
  return sku;
};

// Initial default categories
export const DEFAULT_CATEGORIES = [
  'Electronics',
  'Office Furniture',
  'Kitchenware',
  'Stationery',
  'Apparel'
];

// Initial mock products
export const DEFAULT_PRODUCTS = [
  {
    sku: 'PRD-482910',
    name: 'Sony WH-1000XM5',
    category: 'Electronics',
    price: 349,
    stock: 25
  },
  {
    sku: 'PRD-102938',
    name: 'MacBook Pro M3',
    category: 'Electronics',
    price: 1999,
    stock: 12
  },
  {
    sku: 'PRD-739281',
    name: 'Ergonomic Desk Chair',
    category: 'Office Furniture',
    price: 249,
    stock: 8
  },
  {
    sku: 'PRD-829102',
    name: 'Ceramic Coffee Mug',
    category: 'Kitchenware',
    price: 15,
    stock: 45
  },
  {
    sku: 'PRD-284019',
    name: 'Leather Journal Notebook',
    category: 'Stationery',
    price: 22,
    stock: 60
  },
  {
    sku: 'PRD-582912',
    name: 'Wireless Charger Pad',
    category: 'Electronics',
    price: 29,
    stock: 4
  },
  {
    sku: 'PRD-948271',
    name: 'Running Shoes - Nike Air',
    category: 'Apparel',
    price: 120,
    stock: 0
  },
  {
    sku: 'PRD-619283',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 110,
    stock: 5
  }
];

// Initial mock history log
export const DEFAULT_HISTORY = [
  {
    id: 'hist-1',
    sku: 'PRD-482910',
    name: 'Sony WH-1000XM5',
    type: 'restock', // 'restock' or 'sale'
    quantity: 10,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    notes: 'Initial restock for launch'
  },
  {
    id: 'hist-2',
    sku: 'PRD-948271',
    name: 'Running Shoes - Nike Air',
    type: 'sale',
    quantity: 5,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    notes: 'Bulk purchase order'
  },
  {
    id: 'hist-3',
    sku: 'PRD-102938',
    name: 'MacBook Pro M3',
    type: 'restock',
    quantity: 2,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    notes: 'Restocked low inventory item'
  }
];

// Export products list to CSV file
export const exportToCSV = (products) => {
  const headers = ['SKU', 'Product Name', 'Category', 'Price (LKR)', 'Stock Quantity', 'Stock Status'];
  
  const rows = products.map(p => {
    let status = 'In Stock';
    if (p.stock === 0) status = 'Out of Stock';
    else if (p.stock <= 5) status = 'Low Stock';
    
    return [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`, // escape quotes
      `"${p.category.replace(/"/g, '""')}"`,
      p.price,
      p.stock,
      status
    ];
  });
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
