import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../hooks/userContext";
import { useQueryClient } from "@tanstack/react-query";

const useCartActions = (cart) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;

  // Initialize quantities only once when the hook first runs
  const [quantities, setQuantities] = useState(() => {
    return cart.reduce((acc, item) => {
      acc[item._id] = item.quantity || 1;
      return acc;
    }, {});
  });

  const updateCartQuantity = useCallback(
    async (itemId, newQuantity) => {
      try {
        const response = await axios.patch(
          `${import.meta.env.VITE_APP_SERVER_URL}api/cart/${userId}/${itemId}`,
          { quantity: newQuantity }
        );
        queryClient.setQueryData(["cart", userId], (oldCart) =>
          oldCart.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  quantity: newQuantity,
                  totalprice: item.itemPrice * newQuantity, // Update total price based on quantity
                }
              : item
          )
        );
        toast.success("Quantity updated successfully!");
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update quantity.");
      }
    },
    [queryClient, userId]
  );

  const handleIncrease = useCallback((itemId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantity = prevQuantities[itemId] + 1;
      updateCartQuantity(itemId, updatedQuantity);
      return {
        ...prevQuantities,
        [itemId]: updatedQuantity,
      };
    });
  }, [updateCartQuantity]);

  const handleDecrease = useCallback((itemId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantity = Math.max(prevQuantities[itemId] - 1, 1);
      updateCartQuantity(itemId, updatedQuantity);
      return {
        ...prevQuantities,
        [itemId]: updatedQuantity,
      };
    });
  }, [updateCartQuantity]);

  const handleDelete = useCallback(async (itemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_APP_SERVER_URL}api/cart/${userId}/${itemId}`);
      toast.success("Item successfully deleted!");
      queryClient.setQueryData(["cart", userId], (oldCart) =>
        oldCart.filter((item) => item._id !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item from cart.");
    }
  }, [queryClient, userId]);

  const subTotal = cart.reduce(
    (total, item) => total + item.itemPrice * item.quantity,
    0
  );

  return {
    quantities,
    handleIncrease,
    handleDecrease,
    handleDelete,
    subTotal,
  };
};

export default useCartActions;
