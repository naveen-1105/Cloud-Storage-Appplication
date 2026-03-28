import { axiosWithCreds, axiosWithoutCreds } from "./axiosInstances";

export const fetchUser = async () => {
  const { data } = await axiosWithCreds.get("/user");
  return data;
};

export const fetchAllUsers = async () => {
  const { data } = await axiosWithCreds.get("/users");
  return data;
};

export const logoutUser = async () => {
  const { data } = await axiosWithCreds.post("/auth/logout");
  return data;
};

export const logoutAllSessions = async () => {
  const { data } = await axiosWithCreds.post("/auth/logout-all");
  return data;
};

export const logoutUserById = async (id) => {
  const { data } = await axiosWithCreds.post(`/auth/${id}/logout`);
  return data;
};

export const loginUser = async (formData) => {
  const { data } = await axiosWithCreds.post("/auth/login", formData);
  return data;
};

export const registerUser = async (formData) => {
  const { data } = await axiosWithoutCreds.post("/auth/register", formData);
  return data;
};

export const deleteUserById = async (id) => {
  const { data } = await axiosWithCreds.delete(`/users/${id}`);
  return data;
};
