import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_APP_SERVER_URL;

export default function useReviews(productId) {
  const qc = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    enabled: !!productId,

    queryFn: async () => {
      const res = await axios.get(`${API}api/reviews/product/${productId}`);
      return res.data;
    },

    // ✅ এই অংশটাই loading delay কমাবে
    staleTime: 1000 * 60 * 5,      // 5 মিনিট fresh
    cacheTime: 1000 * 60 * 30,     // 30 মিনিট cache
    refetchOnWindowFocus: false,
    retry: 1,

    // ✅ tab change করলে blank হবে না
    placeholderData: (prev) => prev,
  });

 const addReview = useMutation({
  mutationFn: async (payload) => {
    const res = await axios.post(`${API}api/reviews`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  },
  onSuccess: () => {
    qc.invalidateQueries(["reviews", productId]);
  },
});


  return { ...reviewsQuery, addReview };
}
