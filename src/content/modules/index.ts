import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';
import { m8 } from './m8';
import { m9 } from './m9';
import { m10 } from './m10';
import type { ModuleDef } from './types';

export const MODULES: ModuleDef[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10];

export const MODULE_MAP: Record<string, ModuleDef> = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export { PARTS } from '../meta';

export type { ModuleDef };
