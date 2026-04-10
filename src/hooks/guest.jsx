export const getGuestId = () => {
  let guestId = localStorage.getItem("guestId");

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }

  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem("guestId");
};