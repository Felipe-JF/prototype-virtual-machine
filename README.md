# prototype-virtual machine
 A virtual machine with some testing programs in its machine code

```
deno task start
```

It has two programs written in its machine language, one to save data to a stack on the heap and the other is to calculate the fibbonacci sequence.

The CPU is based on a FIFO queue with random operand access relative to the last item added to the queue.