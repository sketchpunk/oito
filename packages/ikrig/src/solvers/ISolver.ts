import type { Pose } from '@oito/armature';
import type { IKChain } from '..';

export interface ISolver{
    resolve( chain: IKChain, pose: Pose, debug?:any ): void;
}