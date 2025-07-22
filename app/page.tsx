"use client"
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [Url, setUrl] = useState<string | null>("");
  // script to run the login componenet of facebook
  const loginTest = async () => {
    
    try {
      //running the browser without been 
      const response = await axios.post('/api/geturl',{Url});
      if(response.status!==200){
        console.log("Failed to Perform the functionality")
      }else{
        toast.success('Successfully operation performed...')
      }

    } catch (error) {
      console.log('Something went wrong!!!' + error);
    } finally {
      
    }
  }
  return (
    <div className="bg-gradient-to-b from-blue-300 to-blue-400 p-5">
  <div className="flex justify-start items-start text-2xl font-bold">
    SR
    <span className="text-center">
      <h3 className="text-2xl text-center font-light">
        Session Recorder Application
      </h3>
    </span>
  </div>
  <section className="flex flex-col justify-center items-center h-screen">
    <div className="bg-gradient-to-b mt-20 p-5 from-zinc-900 to-zinc-500 text-white flex flex-col justify-center items-center rounded-md shadow-lg">
      <div className="flex justify-center items-center gap-8">
        <input
          className="p-3 bg-zinc-800 focus:outline-none focus:border focus:border-cyan-700 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          value={Url || ""}
          onChange={(e) => { setUrl(e.target.value) }}
          type="text"
          placeholder="Paste the link here...."
        />
        <button 
          onClick={loginTest} 
          className="bg-cyan-600 text-white p-2 rounded-md transition duration-300 ease-in-out hover:bg-cyan-700 shadow-md"
        >
          Submit
        </button>
      </div>
    </div>
  </section>
</div>

  );
}
