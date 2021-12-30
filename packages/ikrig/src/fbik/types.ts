
export interface IVerletPointConfig{
    pole        ?: boolean;
    visible     ?: boolean;
    draggable   ?: boolean;
    mass        ?: number;
    pos         ?: number[];
}

export interface IConstraint{
    resolve():boolean;
    rebind():void;
};