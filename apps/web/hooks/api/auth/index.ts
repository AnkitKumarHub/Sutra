import { trpc } from "~/trpc/client";

export const useSignup = () => {
  
  const utils = trpc.useUtils() // to invalidate the cache after successful signup or login

  const {
    mutateAsync: createUserWithEmailAndPassowrdAsync,
    mutate: createUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassowrd.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate(); // Invalidate the cache for getLoggedInUserInfo query to refetch the user info after successful signup
    }
  });

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
  const utils = trpc.useUtils() // to invalidate the cache after successful signup or login
  const {
    mutateAsync: signInUserWithEmailAndPassowrdAsync,
    mutate: signInUserWithEmailAndPassowrd,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    onSuccess: async  () => {
      await utils.auth.getLoggedInUserInfo.invalidate(); // Invalidate the cache for getLoggedInUserInfo query to refetch the user info after successful login
    }
  });

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
};

//
export const useUser = () => { 
  const {
    data: user,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery();

  return {
    user,
    error,
    isFetching,
    isFetched,
    isLoading,
    status,
  };

  //but here is some problem react Query will cache
};
