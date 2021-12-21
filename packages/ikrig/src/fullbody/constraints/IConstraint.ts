export default interface IConstraint{
    resolve():boolean;
    rebind():void;
};