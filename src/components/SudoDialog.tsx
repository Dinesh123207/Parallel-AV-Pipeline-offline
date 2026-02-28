// Import statements
import React, { useState, useEffect, FormEvent, ReactNode } from "react";
import { appWindow } from "@tauri-apps/api/window";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// import useLoading from "../hooks/useLoading";
import { invoke } from "@tauri-apps/api/tauri";
import { STARTUP_COMMANDS } from "@/utils/constants";

const SudoDialog = (props: { children: ReactNode }) => {
  const { children } = props;
  const [password, setPassword] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [authorized, setAuthorized] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { toast } = useToast();

  // const { isLoading, execute } = useLoading({
  //   functionToExecute: () => invoke("set_password", { password }),
  //   onSuccess: () => {
  //     setAttemptsRemaining((prev) => prev - 1);
  //     setAuthorized(true);
  //     setPassword("");
  //     setIsDialogOpen(false);
  //   },
  //   onError: (err) => {
  //     console.log(err);
  //     setPassword("");
  //     toast({
  //       variant: "destructive",
  //       title: "Wrong Password",
  //       description: `You have entered wrong Password. Only ${
  //         attemptsRemaining - 1
  //       } chances left.`,
  //     });
  //   },
  // });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authorized) {
      invoke("scan", { command: STARTUP_COMMANDS }).then(res => console.log(res)).catch(err => console.log(err)).finally(() => console.log("done"))
    }
  }, [authorized])


  useEffect(() => {
    if (attemptsRemaining < 1) {
      console.log("Closing app due to too many failed attempts");
      appWindow.close();
    }
  }, [attemptsRemaining]);

  const handlePassword = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthorized(true);
    }, 1000);
  };

  return authorized ? (
    <div>{children}</div>
  ) : (
    <div>
      <Dialog open={isDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Super User Password</DialogTitle>
            <DialogDescription>Enter your one-time password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePassword}>
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="password" className="text-right text-white">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                value={password}
                className="col-span-3 text-white"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                className="text-white font-semibold"
              >
                {isLoading ? "Authorizing..." : "Authorize"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SudoDialog;
