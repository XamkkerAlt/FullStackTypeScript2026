import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import UserForm from "./UserForm";
import { OptimisticMessages } from "./OptimisticMessages";
import SubmitButton from "./SubmitButton";
import "./App.css";
import Home from "./Home"
import type { UserType } from "./Home";
import Awaitable from "./Awaitable";
async function fetchData(url: string) {
  const response = await fetch(url);
  const users = await response.json();
  return (Array.isArray(users) ? users : [users]) as UserType[];
}
function App() {
  const [id, setId] = useState("");
  const idToGet = `https://jsonplaceholder.typicode.com/posts/${id}`;
  const fetchPromise = useMemo(() => fetchData(idToGet), [idToGet]);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  return (
    <>
      
      <UserForm />
      <OptimisticMessages />
      <SubmitButton />
    </>
  );
}
export default App;