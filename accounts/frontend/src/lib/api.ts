import { PUBLIC_ACCOUNTS_BACKEND_URL } from "$env/static/public";

interface SignUpResponse {
  access_token: string,
  refresh_token: string,
}

export async function signUp(user_name: string, password: string, first_name: string, last_name: string): Promise<SignUpResponse> {
  const response = await fetch(`${PUBLIC_ACCOUNTS_BACKEND_URL}/sign_up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_name, password, first_name, last_name
    }),
  });

  console.log(response);

  return await response.json();
}

interface LogInResponse {
  access_token: string,
  refresh_token: string,
}

export async function logIn(user_name: string, password: string): Promise<SignUpResponse> {
  const response = await fetch(`${PUBLIC_ACCOUNTS_BACKEND_URL}/log_in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_name, password,
    }),
  });

  return await response.json();
}

interface RefreshResponse {
  access_token: string,
  refresh_token: string,
}

export async function refresh(refresh_token: string): Promise<SignUpResponse> {
  const response = await fetch(`${PUBLIC_ACCOUNTS_BACKEND_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token
    }),
  });

  return await response.json();
}
