import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const {
    mutateAsync: createUserWithEmailAndPassowrdAsync,
    mutate: createUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassowrd.useMutation();

  return {
    createUserWithEmailAndPassowrdAsync,
    createUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};


export const useSignIn = () => {
   const {
    mutateAsync: signInUserWithEmailAndPassowrdAsync,
    mutate: signInUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation();

  return {
    signInUserWithEmailAndPassowrdAsync,
    signInUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
}
