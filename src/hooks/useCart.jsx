import { useQuery } from "@tanstack/react-query";
import { useUser } from "./userContext";
import axios from "axios"; // Import axios directly

const useCart = () => {
    const { user } = useUser();

    const { refetch, data: cart = [] } = useQuery({
        queryKey: ['cart', user?.id],  // Ensure that this only triggers if user?.id exists
        queryFn: async () => {
            if (!user?.id) {
                throw new Error("User is not authenticated");
            }
            const res = await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}api/cart?id=${user.id}`);  // Use axios directly
            return res.data.cartItems;  // Make sure backend sends { cartItems: [...] }
        },
        enabled: !!user?.id,  // Only enable the query if user.id exists
    });

    return [cart, refetch];
}

export default useCart;
