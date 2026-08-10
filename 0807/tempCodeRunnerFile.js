 // (가)6
      let point = 0;
      for (let i = 1; i <= 3; i++) { let point = 0; point += i; }
      console.log(point);

      // (나)13
      for (let i = 0; i < 5; i++) { if (i === 2) continue; if (i === 4) break; console.log(i); }

      // (다)0102 1012 
      for (let i = 0; i < 2; i++) { for (let j = 0; j < 3; j++) { if (j === 1) break; console.log(i, j); } }
