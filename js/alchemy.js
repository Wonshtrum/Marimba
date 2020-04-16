console.log("Alchemy loaded");

const _fit = (a, b) => (a === 1 && (b === -2 || b === 3 || b === -3)) || (a === -2 && (b === 3 || b === -3))
const fit = (a, b) => a === -b || _fit(a, b) || _fit(-b, -a);

class Molecule {
	constructor(chain) {
		this.chain = chain;
	}
	fuse(atom) {
		if (fit(this.chain[0], atom)) this.chain.unshift(atom);
		if (fit(this.chain[this.chain.length], atom)) this.chain.push(atom);
	}
	distill() {
		if (this.chain.length > 2) {
			this.chain = this.chain.slice(1, this.chain.length-1);
			return true;
		}
		return false;
	}
}
