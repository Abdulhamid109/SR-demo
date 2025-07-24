"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function Home() {
  const [Url, setUrl] = useState("");
  const [facebookEmail, setFacebookEmail] = useState<string | null>();
  const [facebookPassword, setFacebookPassword] = useState<string | null>();
  const [twoFactorCode, setTwoFactorCode] = useState<string | null>();
  const [instagramEmail, setinstagramEmail] = useState<string | null>();
  const [moduleStatus, setModuleStatus] = useState<boolean>(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginTest = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/geturl", { 
        facebookEmail,
        facebookPassword,
        twoFactorCode: requiresTwoFactor ? twoFactorCode : null
      });
      
      if (response.status === 200) {
        const data = response.data;
        
        if (data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          toast.success("Please enter your 2FA code");
          setIsLoading(false);
          return;
        }
        
        if (data.requiresManualVerification) {
          toast.error("Manual verification required. Please complete it in the browser window.");
          setIsLoading(false);
          return;
        }
        
        if (data.success) {
          toast.success(data.message || "Session recorded successfully!");
          setModuleStatus(false);
          setRequiresTwoFactor(false);
          setTwoFactorCode(null);
        }
      }
    } catch (error: any) {
      console.log("Something went wrong!!!", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error during session!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateModuleStatus = () => {
    console.log(moduleStatus);
    setModuleStatus(true);
    setRequiresTwoFactor(false);
    setTwoFactorCode(null);
  };

  const closeModal = () => {
    setModuleStatus(false);
    setRequiresTwoFactor(false);
    setTwoFactorCode(null);
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <div className={`p-5 transition-all duration-300 ${moduleStatus ? "opacity-25 pointer-events-none" : ""}`}>
        <div className="text-2xl font-bold">Session Recorder</div>
        <p className="font-extralight text-sm p-2">SR - An Automation Testing Tool</p>
        <button className="bg-red-600 p-2 rounded-md absolute right-5 hover:bg-red-800 top-5">
          Logout
        </button>
        <hr />
        {/* facebook section */}
        <section className="bg-zinc-800 p-2 m-2 rounded-md">
          <div className="flex justify-between p-5 ">
            <h2 className="text-2xl">Facebook</h2>
            <Link className="text-sm hover:underline hover:text-blue-500 " href={"#"}>View All</Link>
          </div>
          <section className="flex flex-col justify-center items-center p-4">
            <section className="flex justify-around items-center w-screen">
              <button onClick={updateModuleStatus} className="bg-blue-400 hover:bg-blue-800 p-2 rounded-md ">
                Login Module
              </button>
              <div className="flex flex-col justify-center items-center">
                <button className="bg-blue-400 hover:bg-blue-800 p-2 rounded-md" >
                  Logout Module
                </button>
                <div>login require - new browser instance</div>
              </div>
            </section>
          </section>
          <Link className="p-2 text-sm hover:underline hover:text-blue-500" href={'/recordings'}>Visit the Facebook recordings</Link>
        </section>
        {/* instagram section */}
        <section className="bg-zinc-800 p-2 m-2 rounded-md">
          <div className="flex justify-between p-5 ">
            <h2 className="text-2xl">Instagram</h2>
            <Link className="text-sm hover:underline hover:text-blue-500 " href={"#"}>View All</Link>
          </div>
          <section className="flex flex-col justify-center items-center p-4">
            <section className="flex justify-around items-center w-screen">
              <button className="bg-blue-400 p-2 rounded-md ">
                Login Module
              </button>
              <div className="flex flex-col justify-center items-center">
                <button className="bg-blue-400 p-2 rounded-md" >
                  Logout Module
                </button>
                <div>login require - new browser instance</div>
              </div>
            </section>
          </section>
          <Link className="p-2 text-sm hover:underline hover:text-blue-500" href={'/recordings'}>Visit the Instagram recordings</Link>
        </section>
      </div>

      {/* Modal */}
      {moduleStatus && (
        <div className="absolute inset-0 flex justify-center items-center z-50">
          <div className={`flex flex-col bg-zinc-900 p-5 text-white rounded-md shadow-lg`}>
            
            {!requiresTwoFactor ? (
              <>
                <input
                  className="p-3 bg-zinc-800 rounded-md mb-4 w-96 mr-4"
                  value={facebookEmail || ""}
                  onChange={(e) => setFacebookEmail(e.target.value)}
                  placeholder="Enter the Email for facebook login"
                  disabled={isLoading}
                />
                <input
                  type="password"
                  className="p-3 bg-zinc-800 rounded-md mb-4 w-96 mr-4"
                  value={facebookPassword || ""}
                  onChange={(e) => setFacebookPassword(e.target.value)}
                  placeholder="Enter the password for facebook login"
                  disabled={isLoading}
                />
              </>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  Two-factor authentication required. Please enter the 6-digit code:
                </p>
                <input
                  type="text"
                  className="p-3 bg-zinc-800 rounded-md w-96 mr-4 text-center text-lg tracking-widest"
                  value={twoFactorCode || ""}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
            )}

            <button
              onClick={loginTest}
              disabled={isLoading || (!facebookEmail || !facebookPassword) || (requiresTwoFactor && !twoFactorCode)}
              className={`px-4 py-2 rounded-md ${
                isLoading 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {isLoading ? "Processing..." : requiresTwoFactor ? "Verify Code" : "Login"}
            </button>

            {requiresTwoFactor && (
              <button
                onClick={() => setRequiresTwoFactor(false)}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                ← Back to login form
              </button>
            )}

            <AiOutlineCloseCircle
              onClick={closeModal}
              className="flex justify-end mt-2 w-full text-2xl text-red-400 hover:text-red-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}