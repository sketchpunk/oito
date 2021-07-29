declare class Node<T> {
    value: T | null;
    prev: Node<T> | null;
    next: Node<T> | null;
    constructor(v: T);
}
declare class CircularLinkedList<T> {
    head: Node<T> | null;
    tail: Node<T> | null;
    count: number;
    add(v: T): CircularLinkedList<T>;
    getNode(v: T): Node<T> | null;
    size(): number;
    iterNext(n?: Node<T> | null): {
        [Symbol.iterator](): {
            next: () => {
                value: T | null;
                done: boolean;
            };
        };
    };
    clear(): CircularLinkedList<T>;
}
export default CircularLinkedList;
export { Node };
