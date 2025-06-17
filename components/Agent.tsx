"use client"
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { google } from '@ai-sdk/google';

type AgentProps = {
  userName: string;
  userId?: string;
  type?: string;
}

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
  }

interface SavedMessages{
  role:'user'|'system'|'assistant';
  content: string;
}


const  Agent = ({userName,userId,type}: AgentProps) => {
  const router=useRouter();
  const[isSpeaking,setIsSpeaking]=useState(false);
  const [callStatus, setCallStatus] = useState < CallStatus>(CallStatus.INACTIVE);
  const [messages,setMessages]=useState <SavedMessages[]>([]);
  // const [retryCount, setRetryCount] = useState(0);
  // const MAX_RETRIES = 3;
  
  // const startVapiCall = async () => {
  //   try {
  //     setCallStatus(CallStatus.CONNECTING);
  //     await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
  //       variableValues: {
  //         userName:userName,
  //         userId:userId,
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Failed to start call:", error);
  //     if (retryCount < MAX_RETRIES) {
  //       setRetryCount(prev => prev + 1);
  //       setTimeout(startVapiCall, 2000); // Retry after 2 seconds
  //     } else {
  //       setCallStatus(CallStatus.FINISHED);
  //       alert("Unable to establish connection. Please try again later.");
  //     }
  //   }
  // };

  useEffect(()=>{
    const onCallStart=()=>{
      setCallStatus(CallStatus.ACTIVE);
      // setRetryCount(0); // Reset retry count on successful connection
    }
    const onCallEnd=()=>{
      setCallStatus(CallStatus.FINISHED);
    }
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) =>  [...prev, newMessage]);
      }
    }
    const onSpeechStart = () => {
      // console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      // console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Vapi Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  },[]);

  useEffect(()=>{
    if(callStatus === CallStatus.FINISHED){
      router.push("/");
    }
  },[messages,callStatus,type,userId]);

  const handleCall = async() => {
    setCallStatus(CallStatus.CONNECTING);
    console.log('Starting VAPI call with variables:', {
      userName,
      userId,
      workflowId: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID
    });
    try {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          userName: userName,
          userId: userId,
        },
      });
    } catch (error) {
      console.error('VAPI call failed:', error);
      setCallStatus(CallStatus.FINISHED);
    }
  }

  const handleDisconnect = async () => {
    console.log('Disconnecting VAPI call');
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  }
  const lastMessage = messages[messages.length-1]?.content;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border my-6">
          <div className="transcript">
           
              <p
                key={lastMessage}
                className={cn(
                  "transition-opacity duration-500 opacity-0",
                  "animate-fadeIn opacity-100"
                )}
              >
                {lastMessage}
              </p>
            
          </div>
        </div>
      )}
      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {isCallInactiveOrFinished
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
