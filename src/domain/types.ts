export type EntryStatus = "open" | "completed" | "archived";
export interface Entry { id:string; text:string; createdAt:number; status:EntryStatus; }
export interface Point { x:number; y:number; }
export type GrowthRelation = "origin" | "continuation" | "lateral";
export interface GrowthModule { id:string; parentId:string|null; axisId:string; relation:GrowthRelation; order:number; bornAtEvent:number; restTurn:number; restLength:number; }
export interface LeafIdentity { entryId:string; bornAtEvent:number; createdAt:number; status:EntryStatus; }
export interface TreeState { schemaVersion:1; soul:string; growthIndex:number; modules:GrowthModule[]; leaves:LeafIdentity[]; }
export interface ProjectedSegment { id:string; parentId:string|null; axisId:string; order:number; bornAtEvent:number; start:Point; end:Point; heading:number; length:number; thickness:number; }
