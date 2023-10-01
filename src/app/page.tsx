"use client";
import { useEffect, useState } from "react";
import { socket } from "@/socket";
import { Button, Input } from "@nextui-org/react";
import { SubmitHandler, useForm } from "react-hook-form";

const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { isConnected };
};

const useMessages = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const onReceiveMessage = (message: string) => {
      setMessages((v) => [...v, message]);
    };

    socket.on("chat message", onReceiveMessage);

    return () => {
      socket.off("chat message", onReceiveMessage);
    };
  }, []);

  return { messages };
};

type FormValues = {
  message: string;
};

export default function Home() {
  const { isConnected } = useSocketConnection();
  const { messages } = useMessages();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = ({ message }) => {
    socket.emit("chat message", message);
    reset({ message: "" });
  };

  const onConnectClick = () => {
    socket.connect();
  };

  const onDisconnectClick = () => {
    socket.disconnect();
  };

  return (
    <main className="min-h-screen p-24">
      <div>
        <p>State: {`${isConnected}`}</p>
        <Button color="primary" onClick={onConnectClick}>
          Connect
        </Button>
        <Button onClick={onDisconnectClick}>Disconnect</Button>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-2">
            <Input
              {...register("message")}
              label="message"
              variant="underlined"
            />
            <Button color="primary" type="submit">
              Send
            </Button>
          </div>
        </form>
        <ul>
          {messages.map((message, i) => (
            <li key={i}>{message}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
