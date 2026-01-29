import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_APP_SERVER_URL;

export default function useAdminReviews() {
  const qc = useQueryClient();
  const token = localStorage.getItem("token");

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await axios.get(`${API}api/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axios.delete(`${API}api/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  // ✅ hide/unhide
  const toggleHide = useMutation({
    mutationFn: async ({ reviewId, isHidden }) => {
      const res = await axios.put(
        `${API}api/admin/reviews/${reviewId}/hide`,
        { isHidden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return { ...reviewsQuery, deleteReview, toggleHide };
}
