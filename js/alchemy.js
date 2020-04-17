console.log("Alchemy loaded");

const _fit = (a, b) => (a === 1 && b === -2) || (a === -2 && (b === 3 || b === -3))
const fit = (a, b) => a === -b || _fit(a, b) || _fit(-b, -a);

const _fuse = (a, b) => {
	//BAB
	let _a = a.chain;
	let _b = b.chain;
	let r = _a;
	if (fit(b.last, a.chain[0])) {
		r = _b.concat(_a);
	} else if (fit(-b.chain[0], a.chain[0])) {
		r = b.reverse().concat(_a);
	}
	new Molecule(r).print();
	if (fit(a.last, b.chain[0])) {
		r = r.concat(_b);
	} else if (fit(a.last, -b.last)) {
		r = r.concat(b.reverse())
	}
	new Molecule(r).print();
	return new Molecule(r);
}

class Molecule {
	constructor(chain) {
		this.chain = chain;
		this.last = chain[chain.length-1];
	}
	print() {
		console.log(this.chain.map(e => Molecule.repr[e]).join(""))
	}
	reverse() {
		return this.chain.reverse().map(e => -e);
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
Molecule.repr = {"1":"◄", "-1":"►", "2":"◖", "-2":"◗", "3":"◉", "-3":"◉"};

let O = new Molecule([3]);
let D = new Molecule([-2]);
let V = new Molecule([1]);
