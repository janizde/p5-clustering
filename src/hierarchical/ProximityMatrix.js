export default class ProximityMatrix {
  constructor(matrix = {}) {
    this.matrix = matrix;
  }

  get(i, j) {
    if (
      this.matrix.hasOwnProperty(i)
      && this.matrix[i].hasOwnProperty(j)
    ) {
      return this.matrix[i][j];
    }

    return null;
  }

  set(i, j, value) {
    if (!this.matrix.hasOwnProperty(i)) {
      this.matrix[i] = {};
    }

    this.matrix[i][j] = value;

    if (!this.matrix.hasOwnProperty(j)) {
      this.matrix[j] = {};
    }

    this.matrix[j][i] = value;
  }

  static createFromPoints(points) {
    const matrix = new ProximityMatrix();

    for (let i = 0; i < points.length; ++i) {
      const pi = points[i];
      for (let j = 0; j <= i; ++j) {
        const pj = points[j];
        const dist = pi.pos.dist(pj.pos);

        matrix.set(pi.id, pj.id, dist);
      }
    }

    return matrix;
  }
}
