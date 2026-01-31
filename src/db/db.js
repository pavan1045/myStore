import Dexie from "dexie";

export const db = new Dexie("myStoreDB");

db.version(1).stores({
  categories: "++id, &name",
  items: "++id, name, modelNumber, categoryId, quantity",
});

db.version(2).stores({
  orders: "++id, itemName, status, createdAt", // Added in v2
});

// Populate with initial categories if empty
db.on("populate", () => {
  db.categories.bulkAdd([
    { name: "Cables" },
    { name: "Chargers" },
    { name: "Cases" },
    { name: "Screen Protectors" },
    { name: "Headphones" },
  ]);
});
