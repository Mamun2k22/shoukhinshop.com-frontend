import { useQuery } from "@tanstack/react-query";
import { useUser } from "./userContext";
import axios from "axios";
import { getGuestId } from "./guest";

const useCart = () => {
  const { user } = useUser();
  const guestId = getGuestId();
  const API = import.meta.env.VITE_APP_SERVER_URL;

  const identifier = user?.id || guestId;

  const { refetch, data: cart = [] } = useQuery({
    queryKey: ["cart", identifier],
    queryFn: async () => {
      const query = user?.id
        ? `userId=${user.id}`
        : `guestId=${guestId}`;

      const res = await axios.get(`${API}api/cart?${query}`);
      return res.data?.cartItems || [];
    },
    enabled: !!identifier,
  });

  return [cart, refetch];
};

export default useCart;