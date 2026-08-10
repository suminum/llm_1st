for (let i = 1; i <= 5; i++) {
  console.log("");
  for (let j = 1; j >= 5 - i; j++) {
    console.log(" ");
  }
  for (let j = i; j > 0; j--) {
    console.log("*");
  }
}
