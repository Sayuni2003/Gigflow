import Gig from "../models/Gig.js";

export const create = (gigData) => {
  return Gig.create(gigData);
};
