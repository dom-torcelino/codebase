import { Router } from "express";

const subscriptionRouter = Router();

subscriptionRouter.get("/", (req, res) => {
  res.send("GET all subscriptions");
});
subscriptionRouter.get("/:id", (req, res) => {
  res.send("GET subscription details");
});
subscriptionRouter.post("/", (req, res) => {
  res.send("CREATE subsciption");
});
subscriptionRouter.put("/:id", (req, res) => {
  res.send("UPDATE subscription");
});
subscriptionRouter.delete("/:id", (req, res) => {
  res.send("DELETE subscription");
});
subscriptionRouter.get("/user/:id", (req, res) => {
  res.send("GET all user subscriptions");
});
subscriptionRouter.put("/:id/cancel", (req, res) => {
  res.send("CANCEL subscription");
});
subscriptionRouter.put("/upcoming-renewals", (req, res) => {
  res.send("GET upcoming renewals");
});

export default subscriptionRouter;