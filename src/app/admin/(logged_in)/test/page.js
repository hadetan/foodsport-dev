"use client";
import { useEffect, useState } from "react";
// let i = 0;
// export default function Test() {
//     const [todos, setTodos] = useState([]);
//     const [filteredTodos, setFilteredTodos] = useState([]);
//     console.log("func init", i++);
//     useEffect(() => {
//         console.log(`Making api call`);
//         fetch("https://jsonplaceholder.typicode.com/todos").then(
//             async (response) => {
//                 const data = await response.json();
//                 setTodos(data);
//                 setFilteredTodos(data);
//             }
//         );
//     }, []);

//     function filterTodos(keyword) {
//         const updatedTodos = todos.filter((task) => {
//             return task.title.includes(keyword);
//         });
//         setFilteredTodos(updatedTodos);
//     }

//     return (
//         <>
//             <h1 className="text-xl mb-40">Test</h1>
//             <input
//                 className="input input-outline input-primary"
//                 placeholder="Search"
//                 onChange={(e) => filterTodos(e.target.value)}
//             ></input>
//             <p>All todos: {todos.length}</p>
//             <p>filteredTodos: {filteredTodos.length}</p>
//             <ul>
//                 {filteredTodos.map((task) => {
//                     return <li>{task?.title}</li>;
//                 })}
//             </ul>
//         </>
//     );
// }

export default function Test() {
    const [text,setText] = useState('Enter Text Here')
const handleUpClick = ()=>{
  console.log('up clcik') 
}
    return (
        <>
            <style>{`
input[type=text], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  
}

input[type=submit] {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}


            `}</style>

            <div>
                <label htmlFor="fname">First Name</label>
                <input
                    type="text"
                    id="fname"
                    name="firstname"
                    placeholder="Your name.."
                    value ={text}
                />

                <input type="submit" value="Submit" onClick ={handleUpClick} />
            </div>
        </>
    );
}
