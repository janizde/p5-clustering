import EventEmitter from 'events';

export default class State extends EventEmitter {

  constructor (states) {
    super();

    this.states = states.map((s, i) => ({
      id: s,
      isCurrent: false,
      order: i,
    }));

    this.isFinished = false;
  }

  get current() {
    return this.states.find(s => s.isCurrent === true);
  }

  init() {
    if (this.states.length > 0) {
      this.states[0].isCurrent = true;
      this.emit(`ENTER_${this.states[0].id}`);
    }
  }

  nextIfCurrent(currentId) {
    const current = this.current;

    if (!current || current.id !== currentId) {
      return;
    }

    this.next();
  }

  next() {
    const currentIdx = this.states.findIndex(s => s.isCurrent === true);

    if (currentIdx > -1) {
      this.states[currentIdx].isCurrent = false;
      this.emit(`LEAVE_${this.states[currentIdx].id}`);
    }

    if (currentIdx + 2 >= this.states.length) {
      this.isFinished = true;
      this.emit('FINISHED');
      return;
    }

    this.states[currentIdx + 1].isCurrent = true;
    this.emit(`ENTER_${this.states[currentIdx + 1].id}`);
  }

  isCurrent(id) {
    const current = this.current;
    return current && current.id === id;
  }

  doIfState(id, callback) {
    if (this.isCurrent(id)) {
      callback();
    }
  }
}
