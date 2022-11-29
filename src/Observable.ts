export class Observable<T> {
  constructor(
    public subscribe: (dispatch: (payload: T) => void) => () => void,
  ) {
  }
}

export class Subject<T> extends Observable<T> {
  subscribers = new Set<(payload: T) => void>();
  constructor() {
    super((dispatch) => {
      this.subscribers.add(dispatch);
      return () => {
        this.subscribers.delete(dispatch);
      };
    });
  }

  dispatch(payload: T) {
    for (const subscriber of this.subscribers) {
      subscriber(payload);
    }
  }
}
