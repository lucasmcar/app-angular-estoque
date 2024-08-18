export interface MaterialUsageLog {
    materialId : string,
    materialName :string ,
    type: string,
    usedBy : string
    usedAt: any; // Pode ser Date ou Firestore Timestamp
    quantityUsed: number;
}

