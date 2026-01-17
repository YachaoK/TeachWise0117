export interface ModuleField {
  name: string;
  required: boolean;
  inputType: string; // 'text' | 'select' | 'slider' | 'file' | 'textarea'
  options?: string[];
  defaultValue?: string;
}

export interface Module {
  id: string;
  category: string;
  name: string;
  description: string;
  fields: ModuleField[];
}

export interface CanvasNode {
  id: string;
  moduleId: string;
  moduleName: string;
  x: number;
  y: number;
  fieldValues?: Record<string, string | number | string[]>; // 存储字段值，支持字符串、数字和字符串数组
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
}
