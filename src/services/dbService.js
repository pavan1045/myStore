import { db } from "../db/db";

export const dbService = {
  // --- Categories ---
  async getCategories() {
    return await db.categories.toArray();
  },

  async addCategory(name) {
    return await db.categories.add({ name });
  },

  async updateCategory(id, name) {
    return await db.categories.update(id, { name });
  },

  async deleteCategory(id) {
    // Optional: Check if items exist in this category before deleting?
    // For now, simple delete.
    // Ideally, we transactionally delete items or warn user.
    return await db.transaction("rw", db.categories, db.items, async () => {
      await db.items.where({ categoryId: id }).delete();
      await db.categories.delete(id);
    });
  },

  // --- Items ---
  async getItems(categoryId = null) {
    if (categoryId) {
      return await db.items.where({ categoryId }).toArray();
    }
    return await db.items.toArray();
  },

  async getItem(id) {
    return await db.items.get(id);
  },

  async addItem(item) {
    return await db.items.add(item);
  },

  async updateItem(id, updates) {
    return await db.items.update(id, updates);
  },

  async deleteItem(id) {
    return await db.items.delete(id);
  },

  // --- Orders ---
  async getOrders() {
    return await db.orders.orderBy("createdAt").reverse().toArray();
  },

  async addOrder(order) {
    // order: { itemName, quantity, status: 'pending', createdAt: new Date() }
    return await db.orders.add({
      ...order,
      status: order.status || "pending",
      createdAt: new Date(),
    });
  },

  async updateOrder(id, updates) {
    return await db.orders.update(id, updates);
  },

  async deleteOrder(id) {
    return await db.orders.delete(id);
  },

  // --- Backup / Restore ---
  async exportDataJSON() {
    const categories = await db.categories.toArray();
    const items = await db.items.toArray();
    return JSON.stringify({ categories, items }, null, 2);
  },

  async importDataJSON(jsonData) {
    const data = JSON.parse(jsonData);
    return await db.transaction("rw", db.categories, db.items, async () => {
      await db.categories.clear();
      await db.items.clear();

      if (data.categories) await db.categories.bulkAdd(data.categories);
      if (data.items) await db.items.bulkAdd(data.items);
    });
  },

  // --- CSV Export / Import ---
  async exportDataCSV() {
    const categories = await db.categories.toArray();
    const items = await db.items.toArray();

    // Create a map of categoryId -> categoryName for easy lookup
    const catMap = {};
    categories.forEach((c) => (catMap[c.id] = c.name));

    // CSV Header
    const headers = [
      "Name",
      "Model",
      "Category",
      "Location",
      "Quantity",
      "Notes",
    ];

    // CSV Rows
    const rows = items.map((item) => [
      item.name,
      item.modelNumber,
      catMap[item.categoryId] || "", // Resolve category ID to name
      item.shelfLocation,
      item.quantity,
      item.notes,
    ]);

    // Helper to escape CSV fields
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return "";
      const stringified = String(str);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (
        stringified.includes(",") ||
        stringified.includes('"') ||
        stringified.includes("\n")
      ) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    return csvContent;
  },

  async importDataCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) return; // Header only or empty

    // Simple CSV parser (limitations: doesn't handle newlines within quotes perfectly, but good enough for simple inventory)
    // For robust parsing, we'd need a regex or library.
    // Let's use a regex that handles quotes.
    const parseCSVLine = (text) => {
      const re = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^,]+)|(,)/g;
      const matches = [];
      let match;
      while ((match = re.exec(text))) {
        if (match[1])
          matches.push(match[1].replace(/\"\"/g, '"')); // Quoted
        else if (match[2])
          matches.push(match[2]); // Unquoted
        else if (match[3]) matches.push(""); // Empty (comma)
      }
      // Handle trailing comma if necessary or empty fields?
      // simple split is risky.
      // Let's fallback to basic split if no quotes found?
      // Actually, let's just stick to a simpler approach for now or use a robust pattern.
      // Re-implementing a simple splitter:
      let cols = [];
      let buffer = "";
      let inQuote = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          if (inQuote && text[i + 1] === '"') {
            // Escaped quote
            buffer += '"';
            i++;
          } else {
            inQuote = !inQuote;
          }
        } else if (char === "," && !inQuote) {
          cols.push(buffer);
          buffer = "";
        } else {
          buffer += char;
        }
      }
      cols.push(buffer);
      return cols;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());

    // Map headers to fields
    // Expected: name, model, category, location, quantity, notes
    const getIndex = (key) => headers.findIndex((h) => h.includes(key));

    const idxName = getIndex("name");
    const idxModel = getIndex("model");
    const idxCat = getIndex("category");
    const idxLoc = getIndex("location");
    const idxQty = getIndex("quantity");
    const idxNotes = getIndex("notes");

    if (idxName === -1)
      throw new Error("Invalid CSV Format: Missing 'Name' column.");

    return await db.transaction("rw", db.categories, db.items, async () => {
      // Merge Strategy: Update existing items, add new ones. Do NOT clear DB.

      const catsSet = new Set();
      const parsedItems = [];

      // First pass: Parse all lines
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const catName = idxCat !== -1 ? cols[idxCat]?.trim() : "Uncategorized";
        if (catName) catsSet.add(catName);

        parsedItems.push({
          name: cols[idxName]?.trim() || "Unknown",
          modelNumber: idxModel !== -1 ? cols[idxModel]?.trim() : "",
          categoryName: catName,
          shelfLocation: idxLoc !== -1 ? cols[idxLoc]?.trim() : "",
          quantity: idxQty !== -1 ? parseInt(cols[idxQty]) || 0 : 0,
          notes: idxNotes !== -1 ? cols[idxNotes]?.trim() : "",
        });
      }

      // 1. Ensure Categories Exist
      const catMap = {}; // name -> id
      for (const catName of catsSet) {
        const existingCat = await db.categories.get({ name: catName });
        if (existingCat) {
          catMap[catName] = existingCat.id;
        } else {
          const id = await db.categories.add({ name: catName });
          catMap[catName] = id;
        }
      }

      // 2. Upsert Items
      for (const item of parsedItems) {
        const { categoryName, ...itemData } = item;
        itemData.categoryId = catMap[categoryName];

        // Check for existing item by Name + ModelNumber (Composite key logic)
        let existingItem;

        if (itemData.modelNumber) {
          existingItem = await db.items
            .where({ name: itemData.name, modelNumber: itemData.modelNumber })
            .first();
        } else {
          existingItem = await db.items.where({ name: itemData.name }).first();
        }

        if (existingItem) {
          // Update existing
          await db.items.update(existingItem.id, itemData);
        } else {
          // Create new
          await db.items.add(itemData);
        }
      }
    });
  },
};
