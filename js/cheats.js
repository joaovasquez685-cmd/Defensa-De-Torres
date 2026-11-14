// TRUCO secreto: se activa tecleando un código durante la partida.
// En levels.json solo se guarda el hash SHA-256 del código, así que leer el archivo no lo revela.
const sha = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))]
  .map(b => b.toString(16).padStart(2, "0")).join("");

export class Cheats {
  #buf = "";
  constructor(g) {
    const c = g.cfg.cheat;
    if (!c || !globalThis.crypto?.subtle) return;
    addEventListener("keydown", async e => {
      if (e.target.tagName === "INPUT" || e.key.length !== 1) return;
      this.#buf = (this.#buf + e.key.toLowerCase()).slice(-c.length);
      if (this.#buf.length === c.length && await sha(this.#buf) === c.hash) {
        this.#buf = "";
        this.apply(g, c);
      }
    });
  }
  apply(g, c) {
    if (!g.state.playing) return;      // solo funciona durante la partida
    g.gold += c.gold;
    g.cfg.maxTowers = c.maxTowers;
    g.extraPrep = c.extraPrep;
    g.bus.emit("stats");
  }
}
