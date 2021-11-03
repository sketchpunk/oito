declare type ClsFn = (cls: unknown) => unknown;
declare function Extender(...parts: Array<ClsFn>): unknown;
export default Extender;
