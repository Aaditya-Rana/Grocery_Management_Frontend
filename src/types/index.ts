// User types
export interface User {
  _id?: string;
  userId?: string;
  id?: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// List Item types
export type ItemStatus = 'to_buy' | 'in_progress' | 'done' | 'unavailable' | 'substituted';

export interface ListItem {
  _id?: string;
  id?: string;
  listId: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
  status: ItemStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Grocery List types
export type ListStatus = 'draft' | 'shared' | 'completed';

export interface GroceryList {
  _id?: string;
  id?: string;
  name: string;
  status: ListStatus;
  userId?: string;
  items?: ListItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Share types
export interface ShareData {
  shareToken: string;
  shopkeeperName?: string;
  status: 'active' | 'accepted';
  acceptedAt?: string;
}

export interface ShareResponse {
  list: GroceryList;
  items: ListItem[];
  share: ShareData;
}

// For Kanban Board
export type KanbanStatus = 'to_buy' | 'in_progress' | 'done' | 'unavailable' | 'substituted';

export interface KanbanItem extends ListItem {
  status: KanbanStatus;
  listName?: string;
}

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  items: KanbanItem[];
}
