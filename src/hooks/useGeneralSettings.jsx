import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_APP_SERVER_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export default function useGeneralSettings() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["general-settings"],
    queryFn: async () => {
      const res = await axios.get(`${API}api/settings/general`);
      return res.data; // { phone, email, address }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const update = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.put(
        `${API}api/admin/settings/general`,
        payload,
        { headers: authHeaders() }
      );
      return res.data; // { message, settings }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["general-settings"] });
    },
  });

  return {
    ...query,
    updateGeneralSettings: update,
  };
}
