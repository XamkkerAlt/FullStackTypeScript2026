interface User {
  name: string;
  age: number;
}

function canDrive(usr: User) {     
  console.log("user is", usr.name);     
  if(usr.age >= 18) {
    console.log("allow to drive");
  } 
  else {
    console.log("do not allow to drive");
  }
}

const tom = {
  name: "tom",
  age: 25
}
canDrive (tom);