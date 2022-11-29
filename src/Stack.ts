class Stack {
  top = 0;
  array = new Int32Array(256);

  static push(stack: Stack, value: number) {
    stack.array[stack.top++] = value;
  }

  static pop(stack: Stack) {
    return stack.array[--stack.top];
  }
}

function push(stack: Stack, value: number) {
  stack.array[stack.top++] = value;
}

function pop(stack: Stack) {
  return stack.array[--stack.top];
}

const stack = new Stack();
Stack.push(stack, 1234);
Stack.pop(stack);
push(stack, 1234);
pop(stack);
