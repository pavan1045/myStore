import { useLiveQuery } from "dexie-react-hooks";
import { dbService } from "../services/dbService";

export function useCategories() {
  return useLiveQuery(() => dbService.getCategories(), [], []);
}

export function useItems(categoryId = null) {
  return useLiveQuery(() => dbService.getItems(categoryId), [categoryId], []);
}

export function useItem(id) {
  return useLiveQuery(() => {
    const itemId = Number(id);
    if (!id || isNaN(itemId)) return undefined;
    return dbService.getItem(itemId);
  }, [id]);
}
