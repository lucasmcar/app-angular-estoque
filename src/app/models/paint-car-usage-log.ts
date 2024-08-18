export interface PaintCarUsageLog {
  carPaintsId: string,
  colorName: string,
  usedBy: string
  usedAt: any; // Pode ser Date ou Firestore Timestamp
  quantityUsed: number;
}
