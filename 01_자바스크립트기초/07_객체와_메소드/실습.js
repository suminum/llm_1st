const item = {
  price: 0,
  upper() {
    return this.price * 1.1;
  },
};
item.price = 1000;
console.log(item.upper());
