console.log("Alchemy loaded");

const _fit = (a, b) => (a === 1 && b === -2) || (a === -2 && (b === 3 || b === -3))
const fit = (a, b) => a === -b || _fit(a, b) || _fit(-b, -a);

const fuse = (a, b) => {
	//BAB
	let _a = a.chain;
	let _b = b.chain;
	let r = _a;
	let react = false;
	if (fit(b.last, a.chain[0])) {
		r = _b.concat(_a);
		react = true;
	} else if (fit(-b.chain[0], a.chain[0])) {
		r = b.reverse().concat(_a);
		react = true;
	}
	if (fit(a.last, b.chain[0])) {
		r = r.concat(_b);
		react = true;
	} else if (fit(a.last, -b.last)) {
		r = r.concat(b.reverse())
		react = true;
	}
	if (react) {
		return new Molecule(r);
	} else {
		return false;
	}
}

const moleculeList = list => {
	if (list.length > 0) {
		let print = "";
		let current;
		let last = list[0].print();
		let times = 1;
		for (let droplet of list.slice(1)) {
			current = droplet.print();
			if (current === last) {
				times++;
			} else {
				print += "\n"+times+" "+last;
				last = current;
				times = 1;
			}
		}
		print += "\n"+times+" "+last;
		return print;
	}
	return "\n..."; 
}

class Molecule {
	constructor(chain) {
		this.chain = chain;
		this.last = chain[chain.length-1];
	}
	print() {
		return this.chain.map(e => Molecule.repr[e]).join("");
	}
	reverse() {
		return this.chain.reverse().map(e => -e);
	}
	copy() {
		return new Molecule(this.chain.copy());
	}
	distill() {
		if (this.chain.length > 2) {
			this.chain = this.chain.slice(1, this.chain.length-1);
			this.last = this.chain[this.chain.length-1];
			return true;
		}
		return false;
	}
};
Molecule.repr = {"1":"◀", "-1":"▶", "2":"◖", "-2":"◗", "3":"◉", "-3":"◉"};

let O = new Molecule([3]);
let D = new Molecule([-2]);
let V = new Molecule([1]);
let r1 = fuse(O, D);
let r2 = fuse(D, O);
let r3 = fuse(V,r1);
let r4 = fuse(r3,V);
r4.print();
