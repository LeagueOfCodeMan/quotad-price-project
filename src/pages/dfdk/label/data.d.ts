export interface LabelListItem {
  id: number;
  label_type: 1 | 2; // 1：产品 2：配件
  state: 1 | 2; // 1：未使用，2：已使用
  name:string; // 描述
  [propName: string]: any;
}

export interface LabelList {
  count: number | undefined;
  results: LabelListItem[];
}

