let arr = ["A", "B", "C"];
let index = 0;

while (true) {
  console.log(arr[index]);

  if (index >= arr.length) {
    break;
  }

  index++;
}

index = 0;

while (true) {
  if (index >= arr.length) {
    break;
  }
  console.log(arr[index]);
  index++;
}
