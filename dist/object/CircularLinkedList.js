class Node {
    constructor(v) {
        this.prev = null;
        this.next = null;
        this.value = v;
    }
}
class CircularLinkedList {
    constructor() {
        this.head = null; // Starting Node
        this.tail = null; // Last node before repeating
        this.count = 0; // How Many nodes added to list
    }
    //constructor(){}
    add(v) {
        const n = new Node(v);
        this.count++;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Empty Linked List, Easy to setup
        if (!this.head || !this.tail) {
            this.head = n;
            this.tail = n;
            n.next = n;
            n.prev = n;
            return this;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        n.prev = this.tail; // New Node Lives between the Tail
        n.next = this.tail.next; // And Its Circular Next, Which should be Head
        this.tail.next = n; // The Previous Tail's Next should be new Node
        this.tail = n; // New Node becomes new tail
        this.head.prev = n; // Head loops backward to tail
        return this;
    }
    getNode(v) {
        if (!this.head)
            return null;
        let n = this.head;
        do {
            if (n.value === v)
                return n;
            n = n.next;
        } while (n !== this.head && n != null);
        return null;
    }
    size() {
        if (!this.head)
            return 0;
        let n = this.head, cnt = 0;
        do {
            cnt++;
            n = n.next;
        } while (n !== this.head && n != null);
        return cnt;
    }
    iterNext(n = null) {
        const result = { value: null, done: false };
        const first = n || this.head;
        let node = first;
        const next = () => {
            if (!node)
                result.done = true;
            else {
                result.value = node.value;
                // If next Item in Linked List, but since its circular, need to 
                // test if the next item is the first item.
                node = (node.next !== first) ? node.next : null;
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
    clear() {
        if (!this.head)
            return this;
        let p, n = this.head;
        do {
            p = n;
            n = n.next;
            p.value = null;
            p.next = null;
            p.prev = null;
        } while (n !== this.head && n != null);
        this.head = null;
        this.tail = null;
        this.count = 0;
        return this;
    }
}
export default CircularLinkedList;
export { Node };
