# Amry Inventory | Premium Inventory Management System

A high-fidelity, premium frontend-only Inventory Management System built with **React**, **Formik**, **Yup**, and **Vanilla CSS**. This application delivers clean visual workflows, interactive analytics, and robust safety validation boundaries for tracking stock, managing products, and exporting data.

---

## 🚀 Key Features Implemented

### 1. Product Management (CRUD)
- **Add & Edit Products**: Modal dialog forms built on **Formik** and verified via **Yup** validations.
- **Auto-generated SKUs**: Product ID (SKU) is automatically generated in the format `PRD-XXXXXX` using a unique random number generator.
- **Custom Categories**: Users can select pre-populated categories or dynamically create custom categories inline within the form.

### 2. Stock Adjustments & Activity Auditing
- **Quick Adjustments**: Quick-action buttons to Restock (incoming) or record a Sale (outgoing) directly from the list.
- **Safety Boundaries**: Sale adjustments are validated to prevent stock from dropping below zero.
- **Audit Activity Log**: A persistent chronological feed tracks all restock/sale events, editing overrides, and bulk adjustments with timestamps and custom remarks.

### 3. Filters, Real-time Search, and Sorting
- **Real-time Search**: Instant search by Product Name or SKU.
- **Multi-Level Filters**: Filter products by category or stock status (`In Stock`, `Low Stock (≤ 5)`, and `Out of Stock`).
- **Flexible Sorting**: Click table column headers (ID, Name, Category, Price, Stock) to sort dynamically in ascending/descending order.
- **Dual Layout Views**: Instant toggle between a structured **Table View** and responsive **Card Grid View**.

### 4. Interactive Custom SVG Charts
- **Category Distribution**: Animated SVG donut chart with segment hover effects, active legends, and total item indicators.
- **Stock Levels**: Animated SVG bar chart displaying top product stock levels with interactive detail tooltips.

### 5. Bulk Batch Actions
- **Select Multi-Items**: Batch select products via checkboxes in table rows or grid cards.
- **Bulk Delete**: Delete multiple items simultaneously.
- **Bulk Restock**: Restock all selected items with a specific quantity (+qty) and add audit remarks in one click.

### 6. Export to CSV & Local Persistence
- **CSV Downloader**: Export the current inventory table directly into a `.csv` spreadsheet file.
- **Offline First**: All states (products, categories, history log, theme settings) persist inside the browser's `localStorage`.
- **System Theme Modes**: Theme toggle for Light and Dark modes with responsive styling.

---

## 🛠️ Technology Stack & Libraries

- **Framework**: [React.js](https://react.dev/) (Vite scaffolding)
- **Form Management**: [Formik](https://formik.org/)
- **Validation Schema**: [Yup](https://github.com/jquense/yup)
- **Styling**: Vanilla CSS (Premium design system using CSS HSL variables, smooth transitions, blur-based glassmorphism, and responsive grids)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 How to Run the Project Locally

### 1. Clone or Open the Directory
Open a terminal in the project directory:
```bash
cd "c:/Users/amrya/Desktop/Cloud Syntex"
```

### 2. Install Dependencies
Install all standard React packages plus Formik, Yup, and Lucide React:
```bash
npm install
```

### 3. Launch Development Server
Start the local Vite dev server:
```bash
npm run dev
```
By default, the server runs on [http://localhost:5173](http://localhost:5173). Open this link in your browser to view the application.

### 4. Build for Production
To bundle and build the project for static hosting:
```bash
npm run build
```
The compiled assets will be outputted in the `/dist` directory.

---

## 🎨 Premium UI/UX Design Rationale

1. **Rich Harmonious Colors**: Utilizes slate and indigo HSL color schemes which adapt smoothly when switching between light and dark modes.
2. **Interactive Micro-Animations**: Smooth scale-ups for modals, slide-ins for toast notifications, and hover transformations on cards and SVG graph elements.
3. **No-Dependency SVG Charts**: High performance dynamic charts drawn using React state vectors, avoiding heavy dependencies and version clashes.
